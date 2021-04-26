import { createStackdriverExtender } from "./extender"
import { field, logger } from "./logger"

describe("Extender", () => {
  it("should add stackdriver extender", () => {
    logger.extend(createStackdriverExtender("coder-dev-1", "logging-package-tests"))
  })

  it("should log", async () => {
    logger.debug("Bananas!", field("frog", { hi: "wow" }))
  })
})
