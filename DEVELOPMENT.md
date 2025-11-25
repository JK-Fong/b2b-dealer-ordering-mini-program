# 开发指南 (Development Guide)

本文档提供 B2B 经销商订货小程序的详细开发和部署指南。

## 目录结构

```
b2b-dealer-ordering-mini-program/
├── src/
│   ├── pages/                    # 页面文件
│   │   ├── login/               # 登录页
│   │   ├── index/               # 首页（商品列表）
│   │   ├── cart/                # 购物车
│   │   ├── checkout/            # 结算页
│   │   ├── order/               # 订单相关
│   │   │   ├── list.vue        # 订单列表
│   │   │   └── success.vue     # 下单成功
│   │   ├── account/             # 我的账户
│   │   └── sales/               # 业务员功能
│   │       └── dealer-select.vue # 代客下单选择经销商
│   ├── mock/                    # Mock 数据
│   │   └── mockData.js         # 模拟 API 和数据
│   ├── utils/                   # 工具函数
│   │   └── api.js              # API 封装
│   ├── store/                   # Vuex 状态管理
│   │   └── index.js            # 全局状态
│   ├── static/                  # 静态资源
│   │   ├── logo.png
│   │   └── tabbar/             # 底部导航栏图标
│   ├── App.vue                  # 应用入口
│   ├── main.js                  # 主入口文件
│   ├── pages.json              # 页面配置
│   ├── manifest.json           # 应用配置
│   └── uni.scss                # 全局样式
├── package.json
├── README.md
└── DEVELOPMENT.md              # 本文档
```

## 开发环境配置

### 1. 安装依赖

```bash
# 克隆项目
git clone https://github.com/JK-Fong/b2b-dealer-ordering-mini-program.git
cd b2b-dealer-ordering-mini-program

# 安装依赖
npm install
# 或使用 yarn
yarn install
```

### 2. 运行项目

#### 方式一：使用 HBuilderX（推荐）

1. 下载并安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 打开 HBuilderX，选择 `文件` -> `导入` -> `从本地目录导入`
3. 选择项目根目录
4. 在 HBuilderX 中，点击 `运行` -> `运行到小程序模拟器` -> `微信开发者工具`

#### 方式二：命令行运行

```bash
# 运行到 H5
npm run dev:h5

# 运行到微信小程序
npm run dev:mp-weixin

# 运行到支付宝小程序
npm run dev:mp-alipay
```

### 3. 微信开发者工具配置

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，导入项目
3. 项目目录选择：`/path/to/b2b-dealer-ordering-mini-program/dist/dev/mp-weixin`
4. AppID：使用测试号或自己的 AppID

## Mock 数据说明

### 测试账号

| 手机号 | 验证码 | 身份 | 可用余额 | 授信额度 |
| :--- | :--- | :--- | :--- | :--- |
| 13800001111 | 任意4位 | 普通经销商 | ¥12,000.50 | ¥50,000.00 |
| 13900002222 | 任意4位 | 业务员 | N/A | N/A |

### 测试场景

#### 场景1：正常下单流程

1. 使用 `13800001111` 登录
2. 在首页浏览商品，加入购物车
3. 进入购物车，调整数量
4. 点击"去结算"
5. 查看资金预检结果
6. 点击"确认下单"
7. 跳转到下单成功页面

#### 场景2：余额不足测试

1. 使用 `13800001111` 登录
2. 将商品数量调整至总金额超过 ¥62,000.50（可用余额 + 授信额度）
3. 进入结算页，观察"账户余额不足"提示
4. 确认"确认下单"按钮置灰

#### 场景3：库存不足测试

1. 在 `src/mock/mockData.js` 中，将某个商品的库存设置为 0
2. 刷新页面，观察该商品的"加入购物车"按钮置灰
3. 尝试在购物车中增加数量，系统会提示"已达最大库存"

#### 场景4：代客下单

1. 使用 `13900002222` 登录（业务员账号）
2. 点击底部导航栏的"我的"，进入账户页面
3. 点击"代客下单"按钮（需要在首页添加入口）
4. 选择一个经销商（如 `B区战略伙伴`）
5. 系统自动跳转到首页，此时所有操作均以该经销商身份进行
6. 完成下单后，订单会标记为业务员代客下单

#### 场景5：订单取消

1. 进入"订单列表"页面
2. 找到状态为"待发货"的订单
3. 点击"取消订单"
4. 确认后，订单状态变为"已取消"，资金自动回滚

#### 场景6：系统维护模拟

由于 `src/utils/api.js` 中设置了 5% 的概率模拟系统异常，在操作过程中可能会随机出现"系统维护中，服务暂时不可用"的提示。这是正常的模拟行为。

## 自定义 Mock 数据

如需修改 Mock 数据，请编辑 `src/mock/mockData.js` 文件：

```javascript
// 修改商品列表
const mockProducts = [
  {
    product_id: 'P001',
    name: '你的商品名称',
    spec: '规格',
    unit: '单位',
    min_order_qty: 起订量,
    price: 价格,
    category: '分类',
    brand: '品牌',
  },
  // 添加更多商品...
];

// 修改库存
const mockStock = {
  'P001': 库存数量,
  // 添加更多库存...
};
```

## 接入真实 ERP 接口

当需要接入真实 ERP 接口时，请按以下步骤操作：

1. 在 `src/utils/api.js` 中，将 `mockApi` 替换为真实的 `uni.request` 调用：

```javascript
const request = async (apiName, params = {}) => {
  try {
    const res = await uni.request({
      url: `${ERP_BASE_URL}/${apiName}`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${globalToken}`
      },
      data: params
    });
    
    if (res.statusCode === 200 && res.data.code === 0) {
      return { success: true, msg: res.data.msg, data: res.data.data };
    } else {
      return { success: false, msg: res.data.msg || '请求失败', data: null };
    }
  } catch (error) {
    return { success: false, msg: '系统维护中，服务暂时不可用', data: null };
  }
};
```

2. 配置 ERP 接口基础 URL：

```javascript
const ERP_BASE_URL = 'https://your-erp-domain.com/api';
```

## 常见问题

### Q1: 页面跳转失败

**A**: 请检查 `src/pages.json` 中是否已正确配置页面路径。

### Q2: 底部导航栏不显示

**A**: 底部导航栏（tabBar）仅在微信小程序端生效。如果在 H5 端测试，需要手动添加导航组件。

### Q3: 图标不显示

**A**: 当前项目中的 tabBar 图标为占位文件，实际使用时需要替换为真实的图标文件（建议尺寸 81px * 81px）。

### Q4: Vuex 状态丢失

**A**: 小程序端刷新会导致 Vuex 状态丢失。项目已通过 `uni.setStorageSync` 和 `INIT_STORE` mutation 实现状态持久化。

## 打包发布

### 微信小程序

```bash
# 构建生产版本
npm run build:mp-weixin

# 生成的文件在 dist/build/mp-weixin 目录
# 使用微信开发者工具打开该目录，进行上传和发布
```

### H5

```bash
# 构建生产版本
npm run build:h5

# 生成的文件在 dist/build/h5 目录
# 可直接部署到静态服务器
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
