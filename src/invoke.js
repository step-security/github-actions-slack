const axios = require('axios');
const context = require("./context");
const { postMessage } = require("./message");
const { addReaction } = require("./reaction");
const { updateMessage } = require("./update-message");

const jsonPretty = (data) => JSON.stringify(data, undefined, 2);

async function validateSubscription() {
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`;

  try {
    await axios.get(API_URL, {timeout: 3000});
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.error(
        'Subscription is not valid. Reach out to support@stepsecurity.io'
      );
      process.exit(1);
    } else {
      core.info('Timeout or API not reachable. Continuing to next step.');
    }
  }
}

const invoke = async () => {
  try {

    await validateSubscription();
    const func = context.getOptional("slack-function") || "send-message";

    switch (func) {
      case "send-message":
        await postMessage();
        break;
      case "send-reaction":
        await addReaction();
        break;
      case "update-message":
        await updateMessage();
        break;
      default:
        context.setFailed("Unhandled `slack-function`: " + func);
        break;
    }
  } catch (error) {
    context.setFailed("invoke failed:" + error + ":" + jsonPretty(error));
  }
};

module.exports = invoke;
