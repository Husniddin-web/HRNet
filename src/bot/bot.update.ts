import { Action, Ctx, Hears, On, Start, Update } from "nestjs-telegraf";
import { BotService } from "./bot.service";
import { Context } from "telegraf";
import { UseInterceptors } from "@nestjs/common";
import { parseEnv } from "util";

@Update()
@UseInterceptors()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.onStart(ctx);
  }

  @Hears("📋 HRlarni Ko'rib chiqish")
  async onHrReview(@Ctx() ctx: Context) {
    return await this.botService.adminHrReviewList(ctx);
  }

  @Hears("Kompanyalarni ko'rib chiqish")
  async onCompanyReviewList(@Ctx() ctx: Context) {
    await this.botService.admincompanyReviewList(ctx);
  }

  @Hears("Yordam so'rovlar")
  async showSupportList(@Ctx() ctx: Context) {
    console.log("salom");
    await this.botService.showSupportList(ctx);
  }

  @On("contact")
  async handlePhoneNumber(@Ctx() ctx: Context) {
    await this.botService.handlePhoneNumber(ctx);
  }

  @Action(/approve_hr_/)
  async approveHr(@Ctx() ctx: Context) {
    await this.botService.approveHr(ctx);
  }

  @Action(/approve_company_/)
  async approveCompany(@Ctx() ctx: Context) {
    await this.botService.approveCompany(ctx);
  }

  @Action(/reject_company_/)
  async rejecetCompany(@Ctx() ctx: Context) {
    await this.botService.askRejectionReasonCompany(ctx);
  }

  @Action(/reject_hr_/)
  async rejectHr(@Ctx() ctx: Context) {
    await this.botService.askRejectionReason(ctx);
  }

  @On("text")
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }

  @Action(/accept_hrcompany_/)
  async acceptNewCompanyHr(@Ctx() ctx: Context) {
    await this.botService.acceptNewCompanyHr(ctx);
  }

  @Action(/reject_hrcompany_/)
  async rejectNewCompanyHr(@Ctx() ctx: Context) {
    await this.botService.rejectNewCompanyHr(ctx);
  }

  @Action(/accept_request_/)
  async acceptRequest(@Ctx() ctx: Context) {
    await this.botService.acceptRequest(ctx);
  }

  @Action(/reject_request_/)
  async rejectRequest(@Ctx() ctx: Context) {
    await this.botService.rejectrequest(ctx);
  }

  @Action(/reply_support_/)
  async replySupport(@Ctx() ctx: Context) {
    await this.botService.replySupport(ctx);
  }
}
