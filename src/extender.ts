import * as gcl from "@google-cloud/logging"
import { Extender, logger, field } from "./logger"

export const createStackdriverExtender = (projectId: string, logId: string): Extender => {
  const logging = new gcl.Logging({
    autoRetry: true,
    projectId,
  })

  const log = logging.log(logId)
  const convertSeverity = (
    severity: "trace" | "info" | "warn" | "debug" | "error",
  ): gcl.protos.google.logging.type.LogSeverity => {
    switch (severity) {
      case "trace":
      case "debug":
        return gcl.protos.google.logging.type.LogSeverity.DEBUG
      case "info":
        return gcl.protos.google.logging.type.LogSeverity.INFO
      case "error":
        return gcl.protos.google.logging.type.LogSeverity.ERROR
      case "warn":
        return gcl.protos.google.logging.type.LogSeverity.WARNING
    }
  }

  return (options): void => {
    const severity = convertSeverity(options.type)
    const metadata: { [id: string]: string } = {}
    if (options.fields) {
      options.fields.forEach((f) => {
        if (!f) {
          return
        }
        metadata[f.identifier] = f.value
      })
    }

    const entry = log.entry(
      {
        severity: severity,
      },
      {
        ...metadata,
        message: options.message,
      },
    )

    log.write(entry).catch((ex: Error) => {
      logger.named("GCP").error("Failed to log", field("error", ex))
    })
  }
}
