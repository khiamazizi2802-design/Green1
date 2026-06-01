const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'ManagerDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. replace order.id.replace('#', '') in render loop
content = content.replace(
  `{order.table || order.room || order.id.replace('#', '')}`,
  `{order.table || order.room || (order.id || '').replace('#', '')}`
);

// 2. replace confirm-cash-payment orderId: order.id.replace('#', '')
content = content.replace(
  `orderId: order.id.replace('#', ''), tableId: order.table`,
  `orderId: (order.id || '').replace('#', ''), tableId: order.table`
);

// 3. replace selectedGuest Table selectedGuest.id.replace('#', '')
content = content.replace(
  `Table {selectedGuest.table || selectedGuest.room || selectedGuest.id.replace('#', '')}`,
  `Table {selectedGuest.table || selectedGuest.room || (selectedGuest.id || '').replace('#', '')}`
);

// 4. replace messageOrder.id.replace('#', '') in header
content = content.replace(
  `Table {messageOrder.table || messageOrder.room || messageOrder.id.replace('#', '')}`,
  `Table {messageOrder.table || messageOrder.room || (messageOrder.id || '').replace('#', '')}`
);

// 5. replace messageOrder.id.replace('#', '') in template🍟
content = content.replace(
  `ist auf dem Weg zu Tisch {messageOrder.table || messageOrder.room || messageOrder.id.replace('#', '')}!`,
  `ist auf dem Weg zu Tisch {messageOrder.table || messageOrder.room || (messageOrder.id || '').replace('#', '')}!`
);

// 6. replace messageOrder.id.replace('#', '') in send socket emit
content = content.replace(
  `table: messageOrder.table || messageOrder.room || messageOrder.id.replace('#', ''),`,
  `table: messageOrder.table || messageOrder.room || (messageOrder.id || '').replace('#', ''),`
);

// 7. replace messageOrder.id.replace('#', '') in alert
content = content.replace(
  `To: \${messageOrder.guest} (Table \${messageOrder.table || messageOrder.room || messageOrder.id.replace('#', '')})`,
  `To: \${messageOrder.guest} (Table \${messageOrder.table || messageOrder.room || (messageOrder.id || '').replace('#', '')})`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully completed all safe-navigation replacements in ManagerDashboard.jsx!');
