/**
 * 测试OAuth流程 - 添加诊断日志
 * 目的：追踪access token的整个生命周期
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

async function testOAuthFlow() {
  console.log('=== OAuth流程诊断 ===\n');

  // 模拟code (这个需要从实际OAuth回调中获取)
  const testCode = process.argv[2];

  if (!testCode) {
    console.log('使用方法: npm run test:oauth -- <code>');
    console.log('\n步骤:');
    console.log('1. 访问: http://localhost:3001/api/auth/login');
    console.log('2. 登录后从URL中复制code参数');
    console.log('3. 运行: npm run test:oauth -- <code>');
    console.log('\n配置信息:');
    console.log(`App ID: ${process.env.FEISHU_APP_ID}`);
    console.log(`Redirect URI: ${process.env.FEISHU_REDIRECT_URI}`);
    console.log(`OAuth Scope: ${process.env.FEISHU_OAUTH_SCOPE}`);
    return;
  }

  try {
    console.log('步骤1: 使用code换取access_token...');
    console.log(`Code: ${testCode.substring(0, 20)}...`);

    const tokenRes = await client.authen.accessToken.create({
      data: {
        grant_type: 'authorization_code',
        code: testCode,
      },
    });

    console.log(`\n响应码: ${tokenRes.code}`);
    console.log(`响应消息: ${tokenRes.msg || 'success'}`);

    if (tokenRes.code !== 0) {
      console.error('❌ 获取access_token失败!');
      console.error('完整响应:', JSON.stringify(tokenRes, null, 2));
      return;
    }

    const accessToken = tokenRes.data?.access_token;
    if (!accessToken) {
      console.error('❌ 响应中没有access_token!');
      return;
    }

    console.log(`✅ 成功获取access_token: ${accessToken.substring(0, 20)}...`);
    console.log(`Token类型: ${tokenRes.data?.token_type}`);
    console.log(`过期时间: ${tokenRes.data?.expires_in}秒`);
    console.log('\n✅ 获取到的用户信息（来自access_token响应）:');
    console.log(`User ID: ${tokenRes.data?.user_id}`);
    console.log(`Name: ${tokenRes.data?.name}`);
    console.log(`Email: ${tokenRes.data?.email}`);
    console.log(`Avatar: ${tokenRes.data?.avatar_url ? '有' : '无'}`);

    console.log('\n🎉 OAuth流程测试成功!');

  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

testOAuthFlow();
