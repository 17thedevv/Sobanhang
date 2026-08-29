const fs = require('fs');

function fixCustomer() {
  const path = 'src/modules/customers/presentation/customer.controller.ts';
  let file = fs.readFileSync(path, 'utf8');

  // Fix where clauses
  file = file.replace(/where: \{ id \}/g, "where: { id: id as string }");
  file = file.replace(/where: \{ id, storeId \}/g, "where: { id: id as string, storeId: storeId as string }");
  file = file.replace(/customerId \}/g, "customerId: customerId as string }");
  file = file.replace(/groupId \}/g, "groupId: groupId as string }");
  file = file.replace(/groupId, storeId \}/g, "groupId: groupId as string, storeId: storeId as string }");
  
  // Fix invoiceInfo error
  file = file.replace(/customer\.invoiceInfo/g, "customer");

  fs.writeFileSync(path, file);
}

function fixDebt() {
  const path = 'src/modules/debt/presentation/debt.controller.ts';
  let file = fs.readFileSync(path, 'utf8');

  // Fix where clauses
  file = file.replace(/where: \{ customerId, storeId \}/g, "where: { customerId: customerId as string, storeId: storeId as string }");
  file = file.replace(/where: \{ id: req.params.id, storeId \}/g, "where: { id: req.params.id, storeId: storeId as string }");
  
  fs.writeFileSync(path, file);
}

fixCustomer();
fixDebt();
console.log('Fixed');
