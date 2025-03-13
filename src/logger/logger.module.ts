import { Global, Module } from "@nestjs/common";
import { AppLogger } from "./logger.service";

@Global()
@Module({
  controllers: [],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
