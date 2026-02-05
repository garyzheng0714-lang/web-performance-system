/**
 * 测试不同的获取用户信息API调用方式
 */

import axios from 'axios';

const testToken = process.argv[2];

if (!testToken) {
  console.log('使用方法: npx ts-node scripts/test-userinfo-api.ts <access_token>');
  console.log('\n需要从OAuth回调中获取access_token进行测试');
  process.exit(1);
}

async function testUserInfoAPI() {
  console.log('测试获取用户信息API...\n');

  // 方法1: 使用 /open-apis/authen/v1/user_info
  console.log('方法1: /open-apis/authen/v1/user_info');
  try {
    const res1 = await axios.get('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
      },
    });
    console.log('✅ 成功!');
    console.log('响应:', JSON.stringify(res1.data, null, 2));
  } catch (error: any) {
    console.log('❌ 失败');
    console.log('错误:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // 方法2: 使用 /open-apis/authen/v1/access_token (可能不对)
  console.log('方法2: /open-apis/contact/v3/users/me');
  try {
    const res2 = await axios.get('https://open.feishu.cn/open-apis/contact/v3/users/me', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
      },
    });
    console.log('✅ 成功!');
    console.log('响应:', JSON.stringify(res2.data, null, 2));
  } catch (error: any) {
    console.log('❌ 失败');
    console.log('错误:', error.response?.data || error.message);
  }
}

testUserInfoAPI();
