/**
 * 添加当前用户到员工信息表
 * 使用方法: npm run add-me -- <your_feishu_user_id>
 */

import * as lark from '@larksuiteoapi/node-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new lark.Client({
  appId: process.env.FEISHU_APP_ID!,
  appSecret: process.env.FEISHU_APP_SECRET!,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
});

const baseToken = process.env.BITABLE_APP_TOKEN!;
const employeesTableId = process.env.BITABLE_TABLE_EMPLOYEES!;

async function addMe() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ 请提供你的飞书用户ID');
    console.log('\n使用方法:');
    console.log('  npm run add-me -- ou_xxxxxxxxxxxxxxx');
    console.log('\n如何获取你的用户ID:');
    console.log('  1. 访问 http://localhost:3001/api/auth/login');
    console.log('  2. 使用飞书登录');
    console.log('  3. 查看后端日志中的用户ID');
    process.exit(1);
  }

  console.log(`📝 添加用户: ${userId}\n`);

  try {
    // 检查用户是否已存在
    const existingRes = await client.bitable.appTableRecord.list({
      path: {
        app_token: baseToken,
        table_id: employeesTableId,
      },
      params: {
        filter: `CurrentValue.[用户ID] = "${userId}"`,
      },
    });

    if (existingRes.data?.items && existingRes.data.items.length > 0) {
      console.log('⚠️  用户已存在!');
      console.log('用户信息:');
      const fields = existingRes.data.items[0].fields;
      console.log(`  姓名: ${fields?.['姓名']}`);
      console.log(`  邮箱: ${fields?.['邮箱']}`);
      console.log(`  角色: ${fields?.['角色']}`);
      return;
    }

    // 添加新用户
    const newUser = {
      用户ID: userId,
      姓名: '待完善', // 用户需要自己完善
      邮箱: `${userId}@example.com`,
      部门: '待分配',
      职位: '待分配',
      主管ID: '',
      角色: '员工', // 默认角色
      状态: '在职',
      创建时间: Date.now(),
    };

    const res = await client.bitable.appTableRecord.create({
      path: {
        app_token: baseToken,
        table_id: employeesTableId,
      },
      data: {
        fields: newUser,
      },
    });

    if (res.code === 0 && res.data?.record) {
      console.log('✅ 用户添加成功！\n');
      console.log('用户信息:');
      console.log(`  用户ID: ${userId}`);
      console.log(`  Record ID: ${res.data.record.record_id}`);
      console.log('\n下一步:');
      console.log('  1. 在飞书中打开「员工信息」表');
      console.log('  2. 完善你的姓名、邮箱、部门等信息');
      console.log('  3. 重新登录: http://localhost:3000/login');
    } else {
      console.error('❌ 添加失败:', res.msg);
    }

  } catch (error: any) {
    console.error('❌ 操作失败:', error.message);
  }
}

addMe();
