# LINHKIEN-PHUTUNG

## Giới thiệu

Đề tài "Xây dựng website quản lý và bán các công cụ phụ tùng xe máy" là đề tài xây dựng một hệ thống quản lý và bán các linh kiện phụ tùng dành cho các dòng xe 2 bánh. Hệ thống này chỉ dành riêng cho các cửa hàng kinh doanh lẻ đang có nhu cầu phát triển thương hiệu của mình.

## Cấu trúc thư mục

## 🎯 Tính năng

- **Thương mại linh kiện trực tuyến**
- **Quản lý cho quản trị viên**
- **Quản lý tại cửa hàng**

## 🛠️ Công nghệ sử dụng

- **Frontend**: ReactJS, Tailwind
- **Backend**: Node.js, Express
- **Hệ thống dành cho quản trị viên**: PHP, Laravel, Tailwind
- **Database**: MongoDB

## 🚀 Cài đặt

```sh
git clone https://github.com/tsdevtool/LINHKIEN-PHUTUNG.git
```

- Terminal backend

**.env**

> PORT
> MONGO_URI
> JWT_SECRET
> NODE_ENV

```sh
    cd backend
```

```sh
   npm install
```

```sh
   npm run dev
```

- Terminal frontend
  **.env**

```sh
   cd frontend
```

```sh
   npm install
```

```sh
   npm run dev
```

- Terminal management

```sh
    download **file** **php_mongodb-1.20.1-8.2-ts-vs16-x64_86**
```

```sh
    copyfile php_mongodb.ddl **paste** vào Xampp\php\ext
```

```sh
    vào Xampp\php **open file** php.ini **find** ;extension=zip **xoá dấu ;**
```

```sh
    line_break **add_line** extension=mongodb **or** extension=php_mongodb
```

```sh
    cd management
```

```sh
   composer install
```

```sh
   php artisan serve
```
