/**
 * 获取当前飞书用户ID的辅助脚本
 *
 * 使用说明:
 * 1. 浏览器访问: http://localhost:3001/api/auth/debug-login
 * 2. 使用飞书账号登录
 * 3. 查看返回的user_id
 * 4. 将user_id添加到员工信息表中
 */

console.log('');
console.log('=' .repeat(60));
console.log('获取飞书用户ID');
console.log('='.repeat(60));
console.log('');
console.log('请按以下步骤操作:');
console.log('');
console.log('1. 启动后端服务 (如果还没启动):');
console.log('   npm run start:dev');
console.log('');
console.log('2. 使用浏览器访问以下URL:');
console.log('   http://localhost:3001/api/auth/login');
console.log('');
console.log('3. 使用你的飞书账号登录');
console.log('');
console.log('4. 登录后查看后端日志,找到类似这样的信息:');
console.log('   用户登录成功: xxx (ou_xxxxxxxxxxxxxxx)');
console.log('   或者会看到错误: 用户不存在');
console.log('');
console.log('5. 记下你的user_id (格式: ou_xxxxxxxxxxxxxxx)');
console.log('');
console.log('6. 运行以下命令将你的ID添加到系统:');
console.log('   npm run add-me -- <your_user_id>');
console.log('');
console.log('=' . repeat(60));
console.log('');
