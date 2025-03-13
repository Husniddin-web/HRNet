import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(user: any) {
    console.log(user);
    await this.mailerService.sendMail({
      to: user.email,
      subject: "HRNET",
      template: "../mail/templates/confirm.hbs",
      context: {
        name: user.full_name,
        user,
      },
    });
  }

  async sendMailHrApproveNotf(user: any) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: "HRNET",
      template: "../mail/templates/hr-confirm.hbs",
      context: {
        name: user.full_name,
        user,
      },
    });
  }

  async sendMailHrRejectNotf(user: any) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: "HRNET",
      template: "../mail/templates/hr-reject.hbs",
      context: {
        name: user.full_name,
        user,
      },
    });
  }

  async sendMailCompanyApprove(user: any) {
    await this.mailerService.sendMail({
      to: user.director_email,
      subject: "HRNET",
      template: "../mail/templates/company-approve.hbs",
      context: {
        name: user.name,
        user,
      },
    });
  }
  async sendMailCompanyReject(user: any) {
    await this.mailerService.sendMail({
      to: user.director_email,
      subject: "HRNET",
      template: "../mail/templates/company-reject.hbs",
      context: {
        name: user.name,
        user,
      },
    });
  }

  async sendMailEmployee(user: any) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: "HRNET",
      template: "../mail/templates/employee-reset.hbs",
      context: {
        name: user.full_name,
        user,
      },
    });
  }

  async sendMailRequestAccess(
    hr_full_name: string,
    hr_email: string,
    access_token: string
  ) {
    await this.mailerService.sendMail({
      to: hr_email,
      subject: "HRNET",
      template: "../mail/templates/request-access.hbs",
      context: {
        name: hr_full_name,
        hr_full_name,
        hr_email,
        access_token,
      },
    });
  }

  async sendMailSupportResponse(response: any) {
    await this.mailerService.sendMail({
      to: response.email,
      subject: "HRNET",
      template: "../mail/templates/send-support.hbs",
      context: {
        response,
      },
    });
  }
}
