# UI 代码实现指南

本文档说明了基于原型图实现的三个核心页面的代码结构和样式规范。

## 代码结构概览

所有页面均采用 **UniApp Vue 2** 语法，遵循以下结构：

```vue
<template>
  <!-- 页面模板 -->
</template>

<script>
  // 页面逻辑
  export default {
    data() { },
    methods: { },
    onShow() { },
  }
</script>

<style scoped>
  /* 页面样式 */
</style>
```

---

## 1. 首页 (pages/index/index.vue)

### 功能模块

| 模块 | 功能说明 | 关键类名 |
| :--- | :--- | :--- |
| **顶部用户信息** | 显示用户名、客户ID、通知和设置图标 | `.header-section`, `.user-info`, `.header-icons` |
| **账户余额卡片** | 显示可用余额、冻结金额、授信额度 | `.balance-card`, `.balance-amount`, `.balance-details` |
| **资金流水列表** | 显示交易记录（支出/收入） | `.transaction-list`, `.transaction-item` |

### 核心样式特点

```css
/* 渐变蓝色头部 */
.header-section {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
}

/* 大号余额数字 */
.balance-amount {
  font-size: 64rpx;
  font-weight: bold;
  color: #1976D2;
}

/* 交易金额颜色区分 */
.transaction-amount.positive { color: #4CAF50; } /* 绿色=收入 */
.transaction-amount.negative { color: #F44336; } /* 红色=支出 */
```

### 数据结构

```javascript
balance: {
  available_balance: 12000.50,  // 可用余额
  frozen_amount: 1500.00,       // 冻结金额
  credit_limit: 50000.00,       // 授信额度
}

transactions: [
  {
    summary: "Order Payment - #ORD-20240515-001",
    time: "2024-05-15 10:30:00",
    amount: -2500.00,             // 负数=支出
    new_balance: 12000.50,
  },
  // ...
]
```

### 交互说明

- ✅ 下拉刷新：`onPullDownRefresh()` 刷新数据
- ✅ 点击通知图标：跳转到通知页面（待实现）
- ✅ 点击设置图标：跳转到设置页面（待实现）

---

## 2. 商品页 (pages/products/products.vue)

### 功能模块

| 模块 | 功能说明 | 关键类名 |
| :--- | :--- | :--- |
| **顶部用户栏** | 显示当前客户名称和退出按钮 | `.top-bar`, `.current-customer`, `.logout-btn` |
| **搜索栏** | 搜索商品名称/编码 | `.search-section`, `.search-bar`, `.search-btn` |
| **商品列表** | 显示商品图片、信息、库存、操作 | `.product-card`, `.product-image`, `.product-info` |
| **底部购物车栏** | 显示购物车总价和结算按钮 | `.cart-float-bar`, `.cart-summary`, `.checkout-btn` |

### 核心样式特点

```css
/* 商品卡片布局 */
.product-card {
  display: flex;
  gap: 20rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
}

/* 商品图片 */
.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

/* 商品价格 */
.product-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #E64A19; /* 红色 */
}

/* 库存标签 */
.stock-badge {
  background-color: #E3F2FD; /* 蓝色背景 */
  border-radius: 20rpx;
}

.stock-badge.out-of-stock {
  background-color: #FFEBEE; /* 红色背景（缺货） */
}

/* 底部购物车栏 */
.cart-float-bar {
  position: fixed;
  bottom: 100rpx; /* 为TabBar留空间 */
  background-color: #333333;
  height: 120rpx;
}

.cart-total {
  font-size: 40rpx;
  font-weight: bold;
  color: #FFD700; /* 金黄色 */
}

.checkout-btn {
  background-color: #FF5722; /* 橙色 */
  border-radius: 30rpx;
}
```

### 数据结构

```javascript
products: [
  {
    product_id: "P001",
    name: "Premium Vodka",
    spec: "500ml/bottle",
    price: 500.00,
    stock: 150,
    min_order_qty: 12,
    qty: 0,                      // 当前选择数量
    image: "/static/vodka.png",  // 商品图片路径
  },
  // ...
]
```

### 交互说明

- ✅ 点击搜索按钮：根据关键词过滤商品
- ✅ 点击 +/- 按钮：调整商品数量（自动校验起订量）
- ✅ 点击"加入购物车"：将商品添加到购物车
- ✅ 点击底部购物车栏：跳转到购物车页面
- ✅ 库存不足时："加入购物车"按钮置灰

### 商品图片说明

**图片路径规范**：
```
/static/products/
├── vodka.png          # 伏特加
├── whiskey.png        # 威士忌
├── gin.png            # 金酒
└── wine.png           # 红酒
```

**图片要求**：
- 尺寸：建议 400x400px（正方形）
- 格式：PNG 或 JPG
- 背景：纯色或简洁背景
- 大小：< 200KB

**占位图**：
```javascript
image: product.image || '/static/placeholder.png'
```

---

## 3. 我的页 (pages/mine/mine.vue)

### 功能模块

| 模块 | 功能说明 | 关键类名 |
| :--- | :--- | :--- |
| **顶部用户信息** | 显示圆形头像、用户名、客户ID | `.header-section`, `.avatar-circle`, `.user-card` |
| **退出登录按钮** | 白色按钮，点击退出登录 | `.logout-button` |
| **快捷菜单** | 购物车入口、代客下单入口 | `.menu-section`, `.menu-item` |
| **订单列表** | 显示历史订单 | `.order-list`, `.order-card` |

### 核心样式特点

```css
/* 圆形头像 */
.avatar-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.25);
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-letter {
  font-size: 56rpx;
  font-weight: bold;
  color: #FFFFFF;
}

/* 退出登录按钮 */
.logout-button {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 40rpx;
  height: 80rpx;
}

/* 购物车徽章 */
.menu-badge {
  background-color: #FF5722;
  border-radius: 20rpx;
  padding: 4rpx 12rpx;
}

/* 代客下单标签 */
.sales-rep-badge {
  background-color: #E3F2FD;
  border-radius: 16rpx;
}

/* 订单状态标签 */
.status-badge.status-pending {
  background-color: #1976D2; /* 蓝色=待发货 */
}

.status-badge.status-cancelled {
  background-color: #999999; /* 灰色=已取消 */
}

/* 订单金额 */
.order-amount {
  font-size: 36rpx;
  font-weight: bold;
  color: #E64A19; /* 红色 */
}
```

### 数据结构

```javascript
userInfo: {
  customer_name: "Zhang San Dealer",
  customer_id: "88291034",
}

orders: [
  {
    order_id: "123456789",
    erp_status_text: "Pending Shipment",
    order_date: "Oct 25, 2023",
    total_amount: 4520.00,
    can_cancel: true,
    can_return: false,
  },
  // ...
]
```

### 交互说明

- ✅ 点击退出登录：弹出确认对话框
- ✅ 点击购物车：跳转到购物车页面
- ✅ 点击代客下单：跳转到经销商选择页面（仅业务员可见）
- ✅ 点击订单卡片：跳转到订单详情页面

---

## 全局样式规范

### 色彩变量

建议在 `uni.scss` 中定义全局颜色变量：

```scss
// 主色调
$primary-color: #1976D2;
$primary-dark: #1565C0;

// 功能色
$success-color: #4CAF50;
$warning-color: #FF9800;
$danger-color: #F44336;
$price-color: #E64A19;

// 中性色
$text-primary: #333333;
$text-secondary: #666666;
$text-tertiary: #999999;
$border-color: #E0E0E0;
$bg-color: #F5F5F5;
```

### 字体规范

```scss
// 字号
$font-size-xs: 22rpx;   // 小标签
$font-size-sm: 24rpx;   // 辅助文字
$font-size-md: 28rpx;   // 正文
$font-size-lg: 32rpx;   // 标题
$font-size-xl: 36rpx;   // 大标题
$font-size-xxl: 56rpx;  // 金额（大）

// 字重
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;
```

### 间距规范

```scss
// 内边距
$padding-xs: 12rpx;
$padding-sm: 20rpx;
$padding-md: 24rpx;
$padding-lg: 30rpx;
$padding-xl: 40rpx;

// 圆角
$border-radius-sm: 8rpx;
$border-radius-md: 12rpx;
$border-radius-lg: 16rpx;
$border-radius-xl: 24rpx;
$border-radius-round: 50%;
```

---

## 响应式适配

### rpx 单位说明

UniApp 使用 `rpx` 单位实现响应式布局：
- 1rpx = 屏幕宽度 / 750
- 设计稿基准：750px 宽度
- 自动适配不同屏幕尺寸

### 固定元素高度

以下元素使用固定高度，不随屏幕变化：
- 底部 TabBar：100rpx
- 底部购物车栏：120rpx
- 顶部导航栏：88rpx（系统默认）

### 可滚动区域

使用 `scroll-view` 或计算高度：
```css
.product-list {
  height: calc(100vh - 240rpx); /* 减去顶部和底部高度 */
}
```

---

## 性能优化建议

### 1. 图片优化

```vue
<!-- 使用懒加载 -->
<image 
  :src="product.image" 
  mode="aspectFill"
  lazy-load
></image>

<!-- 使用占位图 -->
<image 
  :src="product.image || '/static/placeholder.png'" 
  mode="aspectFill"
></image>
```

### 2. 列表优化

```vue
<!-- 使用虚拟列表（长列表） -->
<recycle-list>
  <view v-for="item in list" :key="item.id">
    <!-- 列表项 -->
  </view>
</recycle-list>
```

### 3. 条件渲染

```vue
<!-- 使用 v-if 减少不必要的渲染 -->
<view v-if="$store.getters.isSalesRep" class="menu-item">
  <!-- 代客下单入口 -->
</view>
```

---

## 常见问题

### Q1: 商品图片不显示？

**A**: 检查图片路径是否正确，确保图片文件存在于 `static` 目录下。

```javascript
// 正确路径
image: '/static/products/vodka.png'

// 错误路径（缺少前导斜杠）
image: 'static/products/vodka.png'
```

### Q2: 底部购物车栏被 TabBar 遮挡？

**A**: 调整 `bottom` 值，为 TabBar 留出空间。

```css
.cart-float-bar {
  position: fixed;
  bottom: 100rpx; /* TabBar 高度 */
}
```

### Q3: 样式在 H5 端和小程序端不一致？

**A**: 使用 UniApp 提供的条件编译：

```css
/* #ifdef H5 */
.header-section {
  padding-top: 44px; /* H5 需要额外的状态栏高度 */
}
/* #endif */

/* #ifdef MP-WEIXIN */
.header-section {
  padding-top: 88rpx; /* 小程序导航栏高度 */
}
/* #endif */
```

### Q4: 如何添加骨架屏？

**A**: 在加载状态时显示占位内容：

```vue
<view v-if="loading" class="skeleton">
  <view class="skeleton-item"></view>
  <view class="skeleton-item"></view>
</view>
```

```css
.skeleton-item {
  height: 100rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 下一步优化

1. **增加动画效果**：页面切换、按钮点击反馈
2. **完善空状态设计**：订单列表、流水记录为空时的占位图
3. **添加错误边界**：网络异常、系统维护的友好提示
4. **支持暗黑模式**：根据系统主题自动切换
5. **国际化支持**：多语言切换（中文/英文）

---

## 参考资源

- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [UniApp 组件库](https://uniapp.dcloud.net.cn/component/)
- [微信小程序设计指南](https://developers.weixin.qq.com/miniprogram/design/)
- [原型图设计规范](./wireframes/README.md)

---

## 版本历史

| 版本 | 日期 | 说明 |
| :--- | :--- | :--- |
| v1.0 | 2025-11-26 | 初始版本，基于原型图实现三个核心页面 |
