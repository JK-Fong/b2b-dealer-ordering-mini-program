# B2B 经销商订货小程序 (UniApp + Mock API)

本项目是基于 [B2B 经销商订货小程序产品需求文档 (PRD)](https://github.com/JK-Fong/b2b-dealer-ordering-mini-program/blob/master/PRD.md) 实现的一个 UniApp 示例项目，旨在演示如何使用 UniApp 框架结合 Mock 数据实现 PRD 中定义的**全实时模式**核心业务逻辑和交互规范。

## 核心技术栈

*   **前端框架**: UniApp (Vue 2)
*   **数据模拟**: 本地 Mock API (src/mock/mockData.js)
*   **状态管理**: Vuex
*   **代码托管**: GitHub

## 功能实现概览

本项目严格遵循 PRD 中的核心逻辑，主要实现了以下功能模块：

| 模块 | 核心逻辑实现 | PRD 对应章节 |
| :--- | :--- | :--- |
| **登录** | 手机号+验证码登录，模拟 `CheckUser` 接口校验授权用户。 | 2.1 |
| **首页（资金流水）** | 展示账户余额、授信额度和资金流水记录。实时调用 `Fund.Balance` 和 `GetTransactionList`。 | 2.5 |
| **商品列表** | 模拟 `Product.List` 获取商品，并实时调用 `Product.Stock` 获取库存。库存 <= 0 时，"加入购物车"按钮置灰。 | 2.2 |
| **购物车** | 支持批量修改数量、删除。数量校验（起订量倍数）。 | 2.3 |
| **结算** | **资金预检**：并发调用 `GetStock` 和 `GetBalance`。若总可用资金 < 订单总额，提交按钮置灰并提示缺口。 | 2.3 |
| **下单** | 模拟 `Order.Create` 事务级操作，包含库存/余额校验，并返回订单号。 | 2.4 |
| **我的（订单+账户）** | 整合订单列表查看、购物车入口、代客下单入口。 | 2.6, 2.7 |
| **订单详情** | 支持查看订单详情、取消订单、申请退货，并可跳转购物车。 | 2.6 |
| **代客下单** | 业务员登录后，可模拟 `Dealer.List` 选择经销商，后续所有操作（查询、下单）均携带 `Target_Dealer_ID`。 | 2.7 |
| **全局规则** | 实现了接口异常处理规范（模拟 5% 概率的“系统维护中”提示）。 | 1.1 |

## 导航结构

### 底部导航栏（TabBar）

| 图标 | 名称 | 页面路径 | 功能说明 |
| :---: | :---: | :--- | :--- |
| 🏠 | 首页 | pages/index/index | 显示账户余额和资金流水记录 |
| 📦 | 商品 | pages/products/products | 商品列表、搜索、加入购物车 |
| 👤 | 我的 | pages/mine/mine | 订单列表、购物车、代客下单入口 |

### 页面层级

```
├── 登录页 (pages/login/login)
├── 首页 - 资金流水 (pages/index/index) [TabBar]
├── 商品页 (pages/products/products) [TabBar]
│   ├── 购物车 (pages/cart/cart)
│   └── 结算页 (pages/checkout/checkout)
│       └── 下单成功 (pages/order/success)
└── 我的 (pages/mine/mine) [TabBar]
    ├── 订单详情 (pages/order/detail)
    │   └── 购物车 (pages/cart/cart)
    └── 代客下单 (pages/sales/dealer-select)
```

## Mock 数据说明

所有数据和 API 逻辑均在 `src/mock/mockData.js` 中定义。

### 模拟用户

| 手机号 | 身份 | 备注 |
| :--- | :--- | :--- |
| `13800001111` | 普通经销商 | 默认登录账号，用于测试订货流程。 |
| `13900002222` | 业务员 | 用于测试代客下单功能。 |

### 资金预检测试

默认经销商 `13800001111` 拥有：
*   可用余额: ¥12,000.50
*   授信额度: ¥50,000.00
*   **总可用资金**: ¥62,000.50

可以通过调整购物车商品数量，使订单总额超过此金额来测试**“账户余额不足”**的提示。

## 运行项目

### 1. 安装依赖

```bash
# 确保已安装 Node.js 和 npm
npm install -g @vue/cli @vue/cli-init
# 进入项目目录
cd b2b-dealer-ordering-mini-program
# 安装项目依赖
npm install
```

### 2. 运行开发环境

本项目主要针对小程序端进行开发，推荐使用 HBuilderX 导入项目后运行到微信开发者工具。

如果需要在命令行运行，可以执行：

```bash
# 运行到 H5 (仅用于快速预览)
npm run dev:h5

# 运行到微信小程序 (需要配置微信开发者工具路径)
npm run dev:mp-weixin
```

## 核心功能演示流程

### 流程1：查看资金流水

1. 使用 `13800001111` 登录
2. 进入首页，查看账户余额和资金流水
3. 观察资金变动记录

### 流程2：商品订购

1. 点击底部导航"商品"
2. 浏览商品列表，搜索商品
3. 调整数量，加入购物车
4. 点击底部购物车图标，进入购物车
5. 确认商品和数量，点击"去结算"
6. 查看资金预检结果，点击"确认下单"
7. 跳转到下单成功页面

### 流程3：订单管理

1. 点击底部导航"我的"
2. 查看订单列表
3. 点击订单查看详情
4. 在订单详情页可以：
   - 取消订单（待发货状态）
   - 申请退货（已收货状态）
   - 跳转到购物车继续购物

### 流程4：代客下单

1. 使用 `13900002222` 登录（业务员账号）
2. 点击底部导航"我的"
3. 点击"代客下单"
4. 选择一个经销商
5. 系统自动跳转到商品页面
6. 以该经销商身份进行订货操作

## 交互与规则实现细节

### 异常处理

在 `src/utils/api.js` 中，`request` 函数模拟了 5% 的概率抛出异常（模拟超时或 5xx 错误），此时前端会统一返回 `系统维护中，服务暂时不可用` 的提示，符合 PRD 1.1 规范。

### 单点登录

在 `src/store/index.js` 中，登录成功后会将 `token` 和 `customer_id` 设置到全局 API 封装中，并在 `src/pages/login/login.vue` 的 `onLoad` 中检查登录状态，实现自动登录和未登录跳转。互踢机制通过 `api.js` 中的 `globalToken` 模拟。

### 代客下单

在 `src/pages/sales/dealer-select.vue` 中，业务员选择经销商后，`src/store/index.js` 会设置 `targetDealer`，并更新 `api.js` 中的 `globalTargetDealerId`。所有后续 API 调用（如 `orderCreate`）都会通过 `getGlobalCustomerId()` 自动携带正确的客户 ID，实现身份模拟。

## 项目文档

*   **README.md** - 本文档
*   **DEVELOPMENT.md** - 详细开发指南、测试场景、常见问题
*   **PROJECT_SUMMARY.md** - 项目交付总结和优化建议

## GitHub 仓库

https://github.com/JK-Fong/b2b-dealer-ordering-mini-program

## 技术支持

如有任何问题，请通过 GitHub Issues 提交：
https://github.com/JK-Fong/b2b-dealer-ordering-mini-program/issues
