# 部署指南 - Vercel 部署

## 🚀 快速部署步驟

### 1. 準備環境變數
在 Vercel 專案設定中配置以下環境變數：

#### 必需的環境變數：
```bash
# 資料庫連接
DATABASE_URL=postgresql://username:password@host:port/database

# NextAuth 認證
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://single-class-dennis-yins-projects.vercel.app

# Resend 郵件服務（用於魔術連結登入）
RESEND_API_KEY=re_your-resend-api-key
```

#### 可選的環境變數（根據需要配置）：
```bash
# Google OAuth（如果需要 Google 登入）
AUTH_GOOGLE_CLIENT_ID=your-google-client-id
AUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe 支付
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# PayPal 支付
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox
```

### 2. 資料庫設定

#### 推薦使用 Neon PostgreSQL：
1. 前往 [Neon](https://neon.tech)
2. 建立新專案
3. 複製連接字串到 `DATABASE_URL`
4. 執行資料庫遷移：
   ```bash
   npm run db:push
   ```
5. 建立初始資料：
   ```bash
   npm run db:seed
   ```

### 3. Vercel 部署

#### 方法一：GitHub 自動部署
1. 將代碼推送到 GitHub
2. 在 Vercel Dashboard 連接 GitHub 倉庫
3. 選擇專案：`single-class`
4. 配置環境變數（見上方）
5. 部署！

#### 方法二：CLI 部署
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署到指定專案
vercel --prod --name single-class
```

### 4. 部署後設定

#### 建立管理員帳號：
```bash
# 在本地執行（需要先配置本地 DATABASE_URL）
npm run db:seed
```

或手動在資料庫中將使用者角色設為 'admin'。

#### 測試功能：
- ✅ 首頁載入
- ✅ 使用者註冊/登入
- ✅ 課程瀏覽
- ✅ 支付流程
- ✅ 管理員面板

### 5. 常見問題

#### 資料庫連接錯誤：
- 確認 `DATABASE_URL` 格式正確
- 檢查資料庫是否允許 Vercel 的 IP 連接

#### 認證問題：
- 確認 `NEXTAUTH_SECRET` 已設定
- 確認 `NEXTAUTH_URL` 指向正確的域名

#### 支付功能：
- 測試環境使用 `sandbox` 模式
- 生產環境切換為 `live` 模式

## 🔗 部署結果
部署完成後，你的應用將可在以下地址訪問：
https://single-class-dennis-yins-projects.vercel.app

## 📝 後續步驟
1. 配置自訂域名（如需要）
2. 設定 SSL 證書（Vercel 自動處理）
3. 配置生產環境的支付提供商
4. 設定監控和分析