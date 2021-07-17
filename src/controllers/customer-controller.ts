import Customer from '../models/customer-model';
import Store from '../models/store-model';
import { isStoreCustomer } from './store-controller';
import { decreaseProductQuantities } from './product-controller';
import { sendMail } from '../services/email-service';

const handleOrder = async (customer: any, orderData: any, storeId: string) => {
  const { name, email, phoneNumber, address, orderItems, merchantEmail } = orderData;

  if (!customer) {
    await handleNewCustomerOrder(
      name,
      email,
      phoneNumber,
      address,
      orderItems,
      storeId,
      merchantEmail
    );
  } else {
    await handleExistingCustomerOrder(customer, storeId, orderItems, merchantEmail);
  }

  await sendMailsOnOrder(orderData, merchantEmail, email);
};

const sendMailsOnOrder = async (orderData: any, merchantEmail: string, customerEmail: string) => {
  const merchantSubject = 'You have a new order';
  const merchantText = `Please visit ${process.env.FRONTEND_URL}/order/${orderData._id} to view order`;

  const customerSubject = 'Thank you for buying through Maestro';
  const customerText = `Your order tracking ID is ${orderData.tid}. Please don’t share this with anyone. Visit ${process.env.FRONTEND_URL}/tid and input your tracking ID to view your order status`;

  try {
    await sendMail(merchantEmail, merchantSubject, merchantText);
    await sendMail(customerEmail, customerSubject, customerText);
  } catch (err) {
    throw new Error(err.message);
  }
};

const handleNewCustomerOrder = async (
  name: string,
  email: string,
  phoneNumber: string,
  address: string,
  orderItems: any,
  storeId: string,
  merchantEmail: string
) => {
  const newCustomer = new Customer({
    name,
    email,
    phoneNumber,
    address,
    orders: [{ store: storeId, items: orderItems, date: new Date() }],
  });

  const store = await Store.findById(storeId);
  store.customers.push(newCustomer._id);
  await newCustomer.save();
  await store.save();
  await decreaseProductQuantities(orderItems, merchantEmail);
};

const handleExistingCustomerOrder = async (
  customer: any,
  storeId: string,
  orderItems: any,
  merchantEmail: string
) => {
  customer.orders.push({
    store: storeId,
    items: orderItems,
    date: new Date(),
  });

  const isCustomer = await isStoreCustomer(customer._id, storeId);
  if (!isCustomer) {
    const store = await Store.findById(storeId);
    store.customers.push(customer._id);
    await store.save();
  }

  await customer.save();
  await decreaseProductQuantities(orderItems, merchantEmail);
};

export { handleOrder };
