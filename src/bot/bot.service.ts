import { HR } from "./../../node_modules/.prisma/client/index.d";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Context, Markup, Telegraf } from "telegraf";
import { ROLE } from "@prisma/client";
import { InjectBot } from "nestjs-telegraf";
import { BOT_NAME } from "../app.contstant";
import { MailService } from "../mail/mail.service";
import * as path from "path";
import { AdminService } from "../admin/admin.service";
import { encode } from "../common/helper/crypto";

@Injectable()
export class BotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly amdinService: AdminService,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  private async adminList() {
    const admins = await this.prisma.admin.findMany({
      where: { tg_user_id: { not: null } },
      select: { tg_user_id: true },
    });

    return admins;
  }

  async onStart(ctx: Context) {
    const user_id = ctx.from!.id;

    const user = await this.prisma.tgUser.findUnique({ where: { user_id } });

    if (user) {
      return this.handleUserRole(ctx, user.role!);
    }

    return await this.askPhoneNumber(ctx);
  }

  async askPhoneNumber(ctx: Context) {
    await ctx.reply(
      "📞 Iltimos, telefon raqamingizni yuboring.",
      Markup.keyboard([
        Markup.button.contactRequest("📲 Telefon raqamni jo'natish"),
      ])
        .oneTime()
        .resize()
    );
  }

  async handlePhoneNumber(ctx: Context) {
    if (!ctx.message || !("contact" in ctx.message)) {
      return ctx.reply("❌ Iltimos, telefon raqamingizni jo'nating.");
    }

    const contact = ctx.message.contact;
    const phoneNumber = `+${contact.phone_number.replace(/\D/g, "")}`; // Ensure consistent formatting
    const senderId = ctx.from!.id;

    if (contact.user_id !== senderId) {
      await ctx.reply("⚠️ Iltimos, faqat o'z telefon raqamingizni yuboring!");
      return this.askPhoneNumber(ctx);
    }

    let user = await this.prisma.tgUser.findUnique({
      where: { user_id: senderId },
    });

    if (!user) {
      user = await this.prisma.tgUser.create({
        data: {
          user_id: senderId,
          phone_number: phoneNumber,
          user_name: ctx.from?.username || "",
          first_name: ctx.from?.first_name || "",
        },
      });
    }

    const hr = await this.prisma.hR.findFirst({
      where: { phone_number: phoneNumber },
    });

    if (hr) {
      await this.prisma.hR.update({
        where: { id: hr.id },
        data: { tg_user_id: senderId },
      });
      return this.updateUserRole(ctx, senderId, ROLE.HR);
    }

    const admin = await this.prisma.admin.findFirst({
      where: { phone_number: phoneNumber },
    });

    if (admin) {
      await this.prisma.admin.update({
        where: { id: admin.id },
        data: { tg_user_id: senderId },
      });
      return this.updateUserRole(ctx, senderId, ROLE.ADMIN);
    }

    const employee = await this.prisma.employee.findFirst({
      where: { phone_number: phoneNumber },
    });

    if (employee) {
      await this.prisma.employee.update({
        where: { id: employee.id },
        data: { tg_user_id: senderId },
      });
      return this.updateUserRole(ctx, senderId, ROLE.USER);
    }

    await ctx.reply(
      "⚠️ Siz tizimda ro'yxatdan o'tmagansiz. Iltimos, HrNet platformasidan royhatdan o'ting."
    );
    await this.prisma.tgUser.delete({ where: { user_id: senderId } });
  }

  async updateUserRole(ctx: Context, user_id: number, role: ROLE) {
    await this.prisma.tgUser.update({
      where: { user_id },
      data: { role },
    });

    return this.handleUserRole(ctx, role);
  }

  async handleUserRole(ctx: Context, role: ROLE) {
    switch (role) {
      case ROLE.USER:
        await this.employeeButton(ctx);
        break;
      case ROLE.HR:
        await this.hrMainButton(ctx);
        break;
      case ROLE.ADMIN:
        await this.adminMainButton(ctx);
        break;
      default:
        break;
    }
  }

  async hrMainButton(ctx: Context) {
    await ctx.reply("👨‍💼 HR paneliga xush kelibsiz!", Markup.removeKeyboard());
  }

  async employeeButton(ctx: Context) {
    await ctx.reply(
      "👷‍♂️ Xodim paneliga xush kelibsiz!",
      Markup.removeKeyboard()
    );
  }

  async adminMainButton(ctx: Context) {
    await ctx.reply(
      "👑 <b>Admin paneliga xush kelibsiz!</b>\n\n📌 Quyidagi tugmalardan birini tanlang:",
      {
        parse_mode: "HTML",
        ...Markup.keyboard([
          ["📋 HRlarni Ko'rib chiqish", "Kompanyalarni ko'rib chiqish"],
          ["Yordam so'rovlar"],
        ])
          .resize()
          .oneTime(),
      }
    );
  }

  async sendAdminHrApproval(hrId: number) {
    const admin = await this.amdinService.getAvailableAdmin();
    const hr = await this.prisma.hR.findUnique({ where: { id: hrId } });

    if (!hr) return console.log("HR not found!");

    const message = `
      🆕 Yangi HR ro'yxatdan o'tdi! 
      👤 Ism: ${hr.full_name}
      📞 Telefon: ${hr.phone_number}
      ✉️ Email: ${hr.email}

      📌 Iltimos, tasdiqlash yoki rad etishni tanlang!
    `;
    const inlineKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback("✅ Tasdiqlash", `approve_hr_${hrId}`)],
      [Markup.button.callback("❌ Rad etish", `reject_hr_${hrId}`)],
    ]);

    await this.prisma.hR.update({
      where: { id: hr.id },
      data: { confirm_by_id: admin!.id },
    });

    await this.prisma.admin.update({
      where: { id: admin!.id },
      data: {
        is_busy: true,
        last_active: new Date(),
        request_count: admin!.request_count! + 1,
      },
    });

    await this.bot.telegram.sendMessage(
      Number(admin!.tg_user_id!),
      message,
      inlineKeyboard
    );
  }

  async approveHr(ctx: Context) {
    const data = ctx.callbackQuery!["data"];
    const user_id = ctx.from?.id;

    if (!data) return;

    const hr_id = Number(data.split("_")[2]);

    const hr = await this.prisma.hR.findFirst({ where: { id: hr_id } });
    if (!hr) {
      return await ctx.reply("❌ HR topilmadi.");
    }

    await this.prisma.hR.update({
      where: { id: hr_id },
      data: { status: "ACTIVE" },
    });

    const approvalMessage = `
      ✅ <b>HR tasdiqlandi!</b>

      👤 <b>Ism:</b> ${hr.full_name}
      📞 <b>Telefon:</b> ${hr.phone_number}
      📧 <b>Email:</b> ${hr.email}

    `;

    await ctx.editMessageText(approvalMessage, {
      parse_mode: "HTML",
    });

    await this.mailService.sendMailHrApproveNotf(hr);
    await this.amdinService.adminUpdateRequest(user_id!);
  }

  async askRejectionReason(ctx: Context) {
    const data = ctx.callbackQuery!["data"];
    const user_id = ctx.from?.id;
    const hr_id = data.split("_")[2];

    const admin = await this.prisma.tgUser.update({
      where: { user_id },
      data: { last_state: `ask_rejection_${hr_id}` },
    });
    if (!admin) {
      return await ctx.reply("Admin not found");
    }
    await ctx.editMessageText(
      "Nima uchun bu hr ni rad etmoqdasiz sabablarni kiriting : ",
      {
        parse_mode: "HTML",
      }
    );
  }

  async rejectHr(ctx: Context, hr_id: number, reason: string) {
    const user_Id = ctx.from?.id;

    const hr = await this.prisma.hR.findFirst({ where: { id: hr_id } });

    if (!hr) {
      return await ctx.reply("❌ HR topilmadi.");
    }

    await this.prisma.hR.update({
      where: { id: hr_id },
      data: { status: "BLOCKED", rejection_reason: reason },
    });

    const rejectionMessage = `
        ❌ <b>HR rad etildi!</b>

        👤 <b>Ism:</b> ${hr.full_name}
        📞 <b>Telefon:</b> ${hr.phone_number}
        📧 <b>Email:</b> ${hr.email}

        📝 <b>Rad etish sababi:</b> ${reason}

        <i>Agar bu xato bo'lsa, iltimos, administrator bilan bog'laning.</i>
    `;

    await ctx.reply(rejectionMessage, { parse_mode: "HTML" });

    await this.mailService.sendMailHrRejectNotf(hr);

    await this.amdinService.adminUpdateRequest(user_Id!);
  }

  async onText(ctx: Context) {
    try {
      if ("text" in ctx.message!) {
        const user_id = ctx.from?.id;
        const user = await this.prisma.tgUser.findUnique({
          where: { user_id },
        });

        if (!user) {
          await ctx.reply(`Siz avval royhatdan oting`, {
            parse_mode: "HTML",
            ...Markup.keyboard([["/start"]]).resize(),
          });
        } else {
          if (user.last_state != "finished") {
            const text = ctx.message.text;
            if (user.last_state?.startsWith("ask_rejection")) {
              const hr_id = user.last_state.split("_")[2];
              await this.prisma.tgUser.update({
                where: { user_id },
                data: { last_state: "finished" },
              });
              return await this.rejectHr(ctx, Number(hr_id), text);
            } else if (user.last_state?.startsWith("ask_companyRejection")) {
              const company_id = user.last_state.split("_")[2];
              await this.prisma.tgUser.update({
                where: { user_id },
                data: { last_state: "finished" },
              });
              return await this.rejectCompany(ctx, Number(company_id), text);
            } else if (user.last_state?.startsWith("response_")) {
              const supportId = user!.last_state.split("_")[1];

              const support = await this.prisma.supportReqeust.update({
                where: { id: Number(supportId) },
                data: { status: "INACTIVE", answer: text },
              });

              if (!support) {
                return await ctx.reply("Request topilmadi");
              }

              await ctx.reply("Javobingiz yuborildi");

              await this.mailService.sendMailSupportResponse({
                message: text,
                problem: support?.problem,
                email: support?.email,
              });

              await this.prisma.tgUser.update({
                where: { user_id },
                data: { last_state: "finished" },
              });
              return;
            }
          }
          await ctx.deleteMessage();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async adminHrReviewList(ctx: Context) {
    const id = ctx.from!.id;

    const hrList = await this.prisma.admin.findFirst({
      where: { tg_user_id: id },
      include: {
        HR: {
          where: { status: "PENDING" },

          select: {
            id: true,
            full_name: true,
            phone_number: true,
            email: true,
            status: true,
          },
        },
      },
    });
    console.log(hrList);
    if (hrList?.HR.length == 0) {
      await ctx.reply("Hozirda sizda sorovlar mavjud emas");
    }
    for (const hr of hrList!.HR) {
      const message = `
        🆕 Yangi HR ro'yxatdan o'tdi! 
        👤 Ism: ${hr.full_name}
        📞 Telefon: ${hr.phone_number}
        ✉️ Email: ${hr.email}

        📌 Iltimos, tasdiqlash yoki rad etishni tanlang!
      `;

      const inlineKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback("✅ Tasdiqlash", `approve_hr_${hr.id}`)],
        [Markup.button.callback("❌ Rad etish", `reject_hr_${hr.id}`)],
      ]);

      await ctx.reply(message, inlineKeyboard);
    }
  }

  async sendAdminCompanyApproval(companyId: number) {
    console.log(companyId);
    let admin = await this.amdinService.getAvailableAdmin();

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { created_by: true },
    });

    if (!company) return;

    const filePath = path.resolve(
      __dirname,
      "../../upload",
      company.company_documentation
    );
    console.log(filePath);
    const message = `
        🏢 Yangi Kompaniya Tasdiqlash

        📌 Kompaniya nomi: ${company.name}
        📍 Manzil:${company.address}
        👨‍💼 Direktor: ${company.director_full_name}
        📞 Telefon:${company.director_phone}
        ✉️ Email:${company.director_email}
        👤 Yaratgan HR: ${company.created_by!.full_name || "Noma'lum"}
            
       
            `;

    const inlineKeyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "✅ Kompaniyani Tasdiqlash",
          `approve_company_${company.id}`
        ),
      ],
      [
        Markup.button.callback(
          "❌ Kompaniyani Rad etish",
          `reject_company_${company.id}`
        ),
      ],
    ]);
    await this.prisma.company.update({
      where: { id: company.id },
      data: { confirm_by_id: admin!.id },
    });
    await this.prisma.admin.update({
      where: { id: admin!.id },
      data: {
        is_busy: true,
        last_active: new Date(),
        request_count: admin!.request_count! + 1,
      },
    });

    await this.bot.telegram.sendDocument(Number(admin!.tg_user_id), {
      source: filePath,
    });
    await this.bot.telegram.sendMessage(
      Number(admin!.tg_user_id!),
      message,
      inlineKeyboard
    );
  }

  async approveCompany(ctx: Context) {
    const data = ctx.callbackQuery!["data"];
    const user_id = ctx.from?.id;

    if (!data) return;

    const company_id = Number(data.split("_")[2]);

    console.log(company_id);

    const company = await this.prisma.company.findFirst({
      where: { id: company_id },
      include: { created_by: true },
    });
    if (!company) {
      return await ctx.reply("❌ Company topilmadi.");
    }

    await this.prisma.company.update({
      where: { id: company.id },
      data: { status: "ACTIVE" },
    });

    const hr = await this.prisma.hR.update({
      where: { id: Number(company.created_by_id) },
      data: { is_associate: true },
    });

    await this.prisma.companyHR.create({
      data: {
        hr_id: hr.id,
        company_id: company.id,
        hr_document: company.company_documentation,
        status: "ACTIVE",
      },
    });

    const approvalMessage = `
      ✅ <b>Company tasdiqlandi!</b>

      👤 <b>Ism:</b> ${company.name}
      📞 <b>Telefon:</b> ${company.director_phone}
      📧 <b>Email:</b> ${company.director_email}

    `;

    await ctx.editMessageText(approvalMessage, {
      parse_mode: "HTML",
    });

    await this.mailService.sendMailCompanyApprove(company);
    await this.amdinService.adminUpdateRequest(user_id!);
  }

  async askRejectionReasonCompany(ctx: Context) {
    const data = ctx.callbackQuery!["data"];
    const user_id = ctx.from?.id;
    const company_id = data.split("_")[2];

    const admin = await this.prisma.tgUser.update({
      where: { user_id },
      data: { last_state: `ask_companyRejection_${company_id}` },
    });
    if (!admin) {
      return await ctx.reply("Admin not found");
    }
    await ctx.editMessageText(
      "Nima uchun bu company ni rad etmoqdasiz sabablarni kiriting : ",
      {
        parse_mode: "HTML",
      }
    );
  }

  async rejectCompany(ctx: Context, company_id: number, reason: string) {
    const user_Id = ctx.from?.id;

    const company = await this.prisma.company.findFirst({
      where: { id: company_id },
    });

    if (!company) {
      return await ctx.reply("❌ HR topilmadi.");
    }

    await this.prisma.company.update({
      where: { id: company_id },
      data: { status: "BLOCKED", rejection_reason: reason },
    });

    const rejectionMessage = `
        ❌ <b>Company rad etildi!</b>

        👤 <b>Ism:</b> ${company.name}
        📞 <b>Telefon:</b> ${company.director_phone}
        📧 <b>Email:</b> ${company.director_email}

        📝 <b>Rad etish sababi:</b> ${reason}

        <i>Agar bu xato bo'lsa, iltimos, administrator bilan bog'laning.</i>
    `;

    await ctx.reply(rejectionMessage, { parse_mode: "HTML" });

    await this.mailService.sendMailCompanyReject(company);

    await this.amdinService.adminUpdateRequest(user_Id!);
  }

  async admincompanyReviewList(ctx: Context) {
    const id = ctx.from!.id;

    const companyList = await this.prisma.admin.findFirst({
      where: { tg_user_id: id },
      include: {
        Company: {
          where: { status: "PENDING" },

          select: {
            id: true,
            director_full_name: true,
            director_phone: true,
            director_email: true,
            status: true,
            created_by: true,
            name: true,
            company_documentation: true,
            address: true,
            confirm_by: true,
          },
        },
      },
    });
    console.log(companyList);

    if (companyList?.Company.length == 0) {
      await ctx.reply("Hozirda sizda sorovlar mavjud emas");
    }
    for (const company of companyList!.Company) {
      const filePath = path.resolve(
        __dirname,
        "../../upload",
        company.company_documentation
      );
      const message = `
        🏢 Yangi Kompaniya Tasdiqlash

        📌 Kompaniya nomi: ${company.name}
        📍 Manzil:${company.address}
        👨‍💼 Direktor: ${company.director_full_name}
        📞 Telefon:${company.director_phone}
        ✉️ Email:${company.director_email}
        👤 Yaratgan HR: ${company.created_by!.full_name || "Noma'lum"}
            
       
            `;

      const inlineKeyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "✅ Kompaniyani Tasdiqlash",
            `approve_company_${company.id}`
          ),
        ],
        [
          Markup.button.callback(
            "❌ Kompaniyani Rad etish",
            `reject_company_${company.id}`
          ),
        ],
      ]);

      await this.bot.telegram.sendDocument(
        Number(company.confirm_by?.tg_user_id),
        {
          source: filePath,
        }
      );
      await ctx.reply(message, inlineKeyboard);
    }
  }

  async sendNewCompanyHR(companyHrId: number) {
    const admin = await this.amdinService.getAvailableAdmin();

    if (!admin) {
      throw new Error("No available admin found.");
    }

    const newCompanyHr = await this.prisma.companyHR.findUnique({
      where: { id: companyHrId },
      include: { company: true, hr: true },
    });

    if (!newCompanyHr) {
      throw new Error("Company HR not found.");
    }

    const hrName = newCompanyHr.hr.full_name;
    const companyName = newCompanyHr.company.name;
    const documentationLink = `https://localhost:3000/${newCompanyHr.hr_document}`;

    const message = `
            📢 **New Company HR Request** 📢

            👤 **HR Name:** ${hrName}  
            🏢 **Company Name:** ${companyName}  
            📄 **HR Documentation:** [View Document](${documentationLink})  

            🔹 *Please review and take action.*
            `;

    const inlineButtons = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Accept",
              callback_data: `accept_hrcompany_${companyHrId}`,
            },
            {
              text: "❌ Reject",
              callback_data: `reject_hrcompany_${companyHrId}`,
            },
          ],
        ],
      },
    };

    await this.bot.telegram.sendMessage(Number(admin.tg_user_id), message, {
      parse_mode: "Markdown",
      ...inlineButtons,
    });

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        is_busy: true,
        last_active: new Date(),
        request_count: (admin.request_count ?? 0) + 1,
      },
    });
  }

  async acceptNewCompanyHr(ctx: Context) {
    const id = ctx.from?.id;
    const data = await ctx.callbackQuery!["data"];
    const companyhr_id = data.split("_")[2];
    const companyHr = await this.prisma.companyHR.findUnique({
      where: { id: Number(companyhr_id) },
    });

    if (!companyHr) {
      return await ctx.editMessageText("Company hr not found");
    }

    await this.prisma.hR.update({
      where: { id: companyHr?.hr_id },
      data: { is_associate: true, status: "ACTIVE" },
    });

    await this.prisma.companyHR.update({
      where: { id: companyHr.id },
      data: { status: "ACTIVE" },
    });

    await this.amdinService.adminUpdateRequest(id!);
    await ctx.editMessageText("Company Hr qabul qilindi");
  }

  async rejectNewCompanyHr(ctx: Context) {
    const id = ctx.from?.id;
    const data = await ctx.callbackQuery!["data"];
    const companyhr_id = data.split("_")[2];
    const companyHr = await this.prisma.companyHR.findUnique({
      where: { id: Number(companyhr_id) },
    });

    if (!companyHr) {
      return await ctx.editMessageText("Company hr not found");
    }

    await this.prisma.companyHR.update({
      where: { id: companyHr.id },
      data: { status: "BLOCKED" },
    });

    await this.amdinService.adminUpdateRequest(id!);

    await ctx.editMessageText("Company Hr rad etildi");
  }

  async sendAccessRequestToEmploye(
    employe_id: number,
    hr_id: number,
    request_id: number
  ) {
    // Fetch Employee and HR details
    const employee = await this.prisma.employee.findUnique({
      where: { id: employe_id },
    });

    const hr = await this.prisma.hR.findUnique({
      where: { id: hr_id },
    });

    if (!employee || !hr) {
      throw new Error("Employee or HR not found.");
    }

    const message = `🔹 *Access Request*\n\nHR *${hr.full_name}* (${hr.email}) wants to view your history.\n\nDo you approve this request?`;

    await this.bot.telegram.sendMessage(Number(employee.tg_user_id), message, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Accept",
              callback_data: `accept_request_${request_id}_${hr_id}_${employe_id}`,
            },
            {
              text: "❌ Reject",
              callback_data: `reject_request_${request_id}_${hr_id}`,
            },
          ],
        ],
      },
    });
  }

  async acceptRequest(ctx: Context) {
    const data = await ctx.callbackQuery!["data"];
    const request_id = data.split("_")[2];
    const hr_id = data.split("_")[3];
    const employe_id = data.split("_")[4];
    const hr = await this.prisma.hR.findUnique({
      where: { id: Number(hr_id) },
    });

    const expiration_time = new Date();
    expiration_time.setHours(expiration_time.getHours() + 24);

    const details = {
      expiration_time: expiration_time.toISOString(),
      hr_id,
      employe_id,
    };

    const token = await encode(JSON.stringify(details));

    await this.prisma.accessRequest.update({
      where: { id: Number(request_id) },
      data: { status: "ACTIVE" },
    });

    await ctx.editMessageText("✅ The request has been *ACCEPTED*.");

    await this.bot.telegram.sendMessage(
      Number(hr!.tg_user_id),
      `✅ Your request to access the employee's history has been *APPROVED*.\n\n` +
        `${token}`,
      { parse_mode: "Markdown" }
    );
  }

  async rejectrequest(ctx: Context) {
    const data = await ctx.callbackQuery!["data"];
    const request_id = data.split("_")[2];
    const hr_id = data.split("_")[3];
    console.log(request_id);
    const hr = await this.prisma.hR.findUnique({
      where: { id: Number(hr_id) },
    });

    await this.prisma.accessRequest.update({
      where: { id: Number(request_id) },
      data: { status: "BLOCKED" },
    });

    await this.bot.telegram.sendMessage(
      Number(hr!.tg_user_id),
      `❌ Your request to access the employee's history has been *REJECTED*`,
      { parse_mode: "Markdown" }
    );

    await ctx.editMessageText(
      "✅ You have successfully *rejected* the request."
    );
  }

  async sednHrResponse(response: any) {
    if (response.status == "accept") {
      await this.bot.telegram.sendMessage(
        Number(response.tg_chat),
        `✅ Your request to access the employee's history has been *APPROVED*.\n\n` +
          `${response.token}`,
        { parse_mode: "Markdown" }
      );
    } else {
      await this.bot.telegram.sendMessage(
        Number(response.tg_chat),
        `❌ Your request to access the employee's history has been *REJECTED*`,
        { parse_mode: "Markdown" }
      );
    }
  }

  async sendSupportRequestToAdmin(supportId: number) {
    const support = await this.prisma.supportReqeust.findUnique({
      where: { id: supportId },
      include: { admin: true },
    });

    if (!support || !support.admin) {
      throw new Error("Support request or admin not found");
    }

    const message =
      `🆘 *New Support Request* 🆘\n\n` +
      `📌 *Issue:* ${support.problem}\n` +
      `📌 *Sender Email:* ${support.email}\n` +
      `📅 *Date:* ${new Date().toLocaleString()}`;

    await this.bot.telegram.sendMessage(
      Number(support.admin.tg_user_id),
      message,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Reply to Support",
                callback_data: `reply_support_${support.id}`,
              },
            ],
          ],
        },
      }
    );
  }

  async replySupport(ctx: Context) {
    const data = await ctx.callbackQuery!["data"];
    const supportId = data.split("_")[2];
    const support = await this.prisma.supportReqeust.findUnique({
      where: { id: Number(supportId) },
      include: { admin: true },
    });

    await this.prisma.tgUser.update({
      where: { user_id: Number(support?.admin?.tg_user_id) },
      data: { last_state: `response_${supportId}` },
    });
    await ctx.reply(
      `🆔 **Support ID:** ${support!.id}\n❓ **Problem:** ${support!.problem}\n\n✍️ **Iltimos javobingizni yozing.** :`,
      { parse_mode: "Markdown" }
    );
  }

  async showSupportList(ctx: Context) {
    const id = ctx.from?.id;
    const supportList = await this.prisma.supportReqeust.findMany({
      where: { admin: { tg_user_id: id } },
    });

    if (supportList.length === 0) {
      return await ctx.reply("📭 Sizda hozircha so‘rovlar mavjud emas.");
    }

    for (const support of supportList) {
      const message = `
      📌 *So‘rov ID:* \`${support.id}\`
      👤 *Email:* \`${support.email}\`
      🛠 *Rol:* \`${support.role}\`
      ❓ *Muammo:* \`${support.problem}\`
      ✅ *Javob:* ${support.answer ? `\`${support.answer}\`` : "❌ Hali javob berilmagan"}
      📊 *Holat:* \`${support.status}\`
          `;

      const replyMarkup =
        support.status === "PENDING"
          ? {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "✅ Javob berish",
                      callback_data: `reply_support_${support.id}`,
                    },
                  ],
                ],
              },
            }
          : {};

      await ctx.reply(message, {
        parse_mode: "Markdown",
        ...replyMarkup,
      });
    }
  }
}
