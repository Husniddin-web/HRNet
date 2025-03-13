import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { WorkerHistoryService } from "./worker-history.service";
import { WorkerHistoryController } from "./worker-history.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { BotModule } from "../bot/bot.module";
import {
  AdminAccessTokenStrategy,
  HrAccessTokenStrategy,
} from "../common/strategy";
import { EmployeAccessTokenStrategy } from "../common/strategy/employee-access-token.strategy";
import { MailModule } from "../mail/mail.module";
import { WorkerHistoryMiddleware } from "../common/middleware/delete-own-worker-history";
import { CompanyHrMiddleware } from "../common/middleware/company-hr.middleware";
import { HrCheckMiddleware } from "../common/middleware/hr-check.middleware";

@Module({
  imports: [PrismaModule, BotModule, MailModule],
  controllers: [WorkerHistoryController],
  providers: [
    WorkerHistoryService,
    HrAccessTokenStrategy,
    EmployeAccessTokenStrategy,
    AdminAccessTokenStrategy,
  ],
})
export class WorkerHistoryModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WorkerHistoryMiddleware)
      .forRoutes({ path: "worker-history:id", method: RequestMethod.DELETE });

    consumer
      .apply(CompanyHrMiddleware)
      .forRoutes({ path: "worker-history:id", method: RequestMethod.PATCH });

    consumer
      .apply(HrCheckMiddleware)
      .forRoutes({ path: "worker-history:id", method: RequestMethod.POST });
  }
}
