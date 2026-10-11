# 中禾报价移动工作台

面向手机浏览器的报价管理 PWA，与原微信小程序报价模块使用同一套数据结构。

## 功能

- 登录并同步 `https://wuhaoxuesheng.cn/api/state`
- 报价列表、关键词搜索、状态筛选和到期自动标记
- 新建、编辑、复制、删除报价
- 多产品、多工艺、多配件、多包装、多档阶梯价格
- 装箱数据、打样信息、报价图和参考图
- 报价详情、状态流转、打印/PDF、PNG 图片导出
- PWA 安装与静态资源离线缓存
- 演示模式使用浏览器本地数据，不会写入正式服务器

## 本地预览

```bash
python3 -m http.server 8080
```

打开 `http://localhost:8080`。正式部署时建议放到 `wuhaoxuesheng.cn` 同源路径，或为 API 配置允许凭据的 CORS/反向代理。

## 部署说明

纯静态文件，可部署到 GitHub Pages、Cloudflare Pages、OpenAI Sites 或现有服务器。若部署在其他域名，正式接口必须允许该域名携带 Cookie 访问。
