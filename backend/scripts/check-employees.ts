import * as dotenv from 'dotenv';
import * as lark from '@larksuiteoapi/node-sdk';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkEmployees() {
  const client = new lark.Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
  });

  const appToken = process.env.BITABLE_APP_TOKEN;
  const tableId = process.env.BITABLE_TABLE_EMPLOYEES;

  console.log('正在检查员工信息表...');
  console.log('App Token:', appToken);
  console.log('Table ID:', tableId);

  try {
    // 获取所有记录
    const res = await client.bitable.appTableRecord.list({
      path: {
        app_token: appToken,
        table_id: tableId,
      },
      params: {
        page_size: 100,
      },
    });

    if (res.code !== 0) {
      console.error('获取记录失败:', res.msg);
      return;
    }

    const records = res.data?.items || [];
    console.log(`\n找到 ${records.length} 条员工记录:\n`);

    if (records.length === 0) {
      console.log('❌ 员工信息表为空！需要添加测试用户。');
      console.log('\n建议运行以下命令添加测试用户:');
      console.log('npm run add:testuser');
      return;
    }

    records.forEach((record, index) => {
      const fields = record.fields || {};
      console.log(`${index + 1}. 员工信息:`);
      console.log(`   姓名: ${fields['姓名'] || '未设置'}`);
      console.log(`   用户ID: ${fields['用户ID'] || '未设置'}`);
      console.log(`   邮箱: ${fields['邮箱'] || '未设置'}`);
      console.log(`   部门: ${fields['部门'] || '未设置'}`);
      console.log(`   职位: ${fields['职位'] || '未设置'}`);
      console.log(`   角色: ${fields['角色'] || '未设置'}`);
      console.log(`   状态: ${fields['状态'] || '未设置'}`);
      console.log('');
    });

    console.log('✅ 检查完成！');
    console.log('\n提示: 使用飞书账号登录时，系统会根据"用户ID"字段匹配用户。');
    console.log('如果登录失败，请确认你的飞书用户ID已添加到员工信息表中。');

  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkEmployees();
