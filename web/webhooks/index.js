import productWebhooks from './productWebhooks.js';
import orderWebhooks from './orderWebhooks.js';
import customerWebhooks from './customerWebhooks.js';


//combine all the webhooks into a single object
const webhookHandlers = {
    ...productWebhooks, ...orderWebhooks, ...customerWebhooks
};

export default webhookHandlers;
