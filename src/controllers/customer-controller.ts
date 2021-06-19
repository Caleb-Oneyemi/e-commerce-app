import Customer from '../models/customer-model';
import Store from '../models/store-model';
import { isStoreCustomer } from './store-controller';
import { decreaseProductQuantities } from './product-controller';

const handleOrder = async (customer: any, orderData: any, storeId: string) => {
  const { name, email, phoneNumber, address, orderItems } = orderData;

  if (!customer) {
    await handleNewCustomerOrder(
      name,
      email,
      phoneNumber,
      address,
      orderItems,
      storeId
    );
  } else {
    await handleExistingCustomerOrder(customer, storeId, orderItems);
  }
};

const handleNewCustomerOrder = async (
  name: string,
  email: string,
  phoneNumber: string,
  address: string,
  orderItems: any,
  storeId: string
) => {
  const newCustomer = new Customer({
    name,
    email,
    phoneNumber,
    address,
    orders: [{ store: storeId, items: orderItems, date: new Date() }],
  });

  const store = await Store.findById(storeId);
  let customers = store.customers;
  customers[newCustomer._id] = true;
  store.customers = customers;
  await newCustomer.save();
  await store.save();
  await decreaseProductQuantities(orderItems);
};

const handleExistingCustomerOrder = async (
  customer: any,
  storeId: string,
  orderItems: any
) => {
  customer.orders.push({
    store: storeId,
    items: orderItems,
    date: new Date(),
  });

  const isCustomer = await isStoreCustomer(customer._id, storeId);
  if (!isCustomer) {
    const store = await Store.findById(storeId);
    let customers = store.customers;
    customers[customer._id] = true;
    store.customers = customers;
    await store.save();
  }

  await customer.save();
  await decreaseProductQuantities(orderItems);
};

export { handleOrder };
