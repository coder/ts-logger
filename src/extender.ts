import * as gcl from "@google-cloud/logging"
import { Extender, field, Level, logger } from "./logger"

export const createStackdriverExtender = (projectId: string, logId: string): Extender => {
  const logging = new gcl.Logging({
    autoRetry: true,
    projectId,
  })

  const log = logging.log(logId)
  const convertSeverity = (severity: Level): gcl.protos.google.logging.type.LogSeverity => {
    switch (severity) {
      case Level.Trace:
      case Level.Debug:
        return gcl.protos.google.logging.type.LogSeverity.DEBUG
      case Level.Info:
        return gcl.protos.google.logging.type.LogSeverity.INFO
      case Level.Warning:
        return gcl.protos.google.logging.type.LogSeverity.WARNING
      case Level.Error:
        return gcl.protos.google.logging.type.LogSeverity.ERROR
    }
  }

  return (options): void => {
    const severity = convertSeverity(options.level)
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
      { severity },
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
