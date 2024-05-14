## 基于混合推荐算法的文学作品推荐系统
1. `当前文件` 前端 https://github.com/Luyabs/literary-works-recommendation-frontend
2. 业务后端 https://github.com/Luyabs/literary-works-recommendation-backend
3. 算法端 https://github.com/Luyabs/literary-works-recommendation-algorithm

## 本项目基于开源框架vue-admin-template进行二次开发
`vea原模板` http://panjiachen.github.io/vue-admin-template   
`改进后更易二次开发的模板` https://github.com/Luyabs/springboot-vue-template   

## 项目运行方式
1. 与vue-element-admin一样，准备好 nodejs <= 16   
2. 在当前项目的根目录下打开终端
3. 输入npm install --registry=https://registry.npm.taobao.org 安装依赖
4. 通过npm run dev运行前端项目
5. `注意` 你必须先运行业务后端，否则无法登录！
6. `注意` 如果要获取推荐服务，则还需要运行算法后端！

## 重要目录-src目录下的文件结构
1. src/api 接口文件目录 -> 此目录存储所有访问后端接口的函数
2. src/router 路由文件目录 -> 此目录为前端的URL与页面建立联系
3. src/views 视图文件目录 -> 此目录存储大部分页面文件（.vue文件）
4. 其余目录下的文件大多未在vea的基础上做过多调整（从vue-element-template上额外集成了权限相关的功能），熟悉该框架或其它vue项目的开发者能快速上手本项目

## 部分页面展示
![image](https://github.com/Luyabs/literary-works-recommendation-frontend/assets/74538732/12b582a5-da40-491f-9b38-66331cf42caf)


## 系统用例图
![image](https://github.com/Luyabs/literary-works-recommendation-frontend/assets/74538732/7144c98a-ca43-4dfe-be21-c004510b688f)
![image](https://github.com/Luyabs/literary-works-recommendation-frontend/assets/74538732/786dd1e7-61d8-4ee6-9166-2471b69288af)
![image](https://github.com/Luyabs/literary-works-recommendation-frontend/assets/74538732/105eca14-22ea-41f5-ac96-fe328ec33d23)
![image](https://github.com/Luyabs/literary-works-recommendation-frontend/assets/74538732/66e9988f-cdf9-4042-ada9-767d402c8914)
![image](https://github.com/Luyabs/literary-works-recommendation-frontend/assets/74538732/187c95f5-7866-42c9-97bf-b5e0d9740671)


