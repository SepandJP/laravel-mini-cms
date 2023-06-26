<p align="center"><a href="https://larami.iran.liara.run/" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400"></a></p>



# درباره LaramiCMS

یک سیستم بلاگ نوشته شده با استفاده از فریمورک [لاراول](https://laravel.com/) بوده که قسمت عمده  UI آن با استفاده از قالب‌های آماده نوشته شده با [Bootstrap5](https://blog.getbootstrap.com/2021/05/05/bootstrap-5/) پیاده‌سازی شده است.


# مشاهده آنلاین

<br/>

برای مشاهده و کار با صفحات مختلف بلاگ روی لینک زیر کلید کنید:
 **[مشاهده آنلاین](https://larami.iran.liara.run/)**

برای مشاهده و کار با صفحات پنل مدیریت روی لینک زیر کلید کنید:
**[پنل مدیریت](https://larami.iran.liara.run/admin/dashboard)**

### ورود به پنل مدیریت

در صورتی که قبلاً وارد پنل شده باشید، صفحه داشبورد را مشاهده کرده و به بخش‌های مختلف دسترسی دارید. در صورتی که به صفحه Login هدایت شدید، با مشخصات زیر وارد شوید:

>Enail: sheidenreich@example.com

>Password: adminPassword


# امکانات
<div align="right">

### وبلاگ
- استفاده از [Pagination](https://laravel.com/docs/8.x/pagination) جهت صفحه بندی مطالب و فهرست‌های پنل مدیریت
- امکان پاسخ‌دهی به نظرات و نمایش تودرتوی پاسخ نظرات
- امکان جستجوی در بین مطالب

### بخش مدیریت
 - نوشتن و ویرایش مطالب 
 - اضافه کردن دسته‌بندی مطالب
 - تعریف کاربر جدید
 - ویرایش مشخصات کاربران و تغییر میزان دسترسی آن‌ها
 - تایید نظرات ثبت شده جهت نمایش در وبلاگ یا عدم تایید آن‌ها
 - سطوح دسترسی و کاربری متفاوت
 </div>

# نصب برنامه
نصب پروژه به دو روش امکان پذیر می‌باشد:
- [نصب در XAMPP به وسیله composer](#نصب-در-xampp-به-وسیله-composer)
- [نصب توسط Docker](#نصب-توسط-docker)

- ## نصب در XAMPP به وسیله composer
برای نصب برنامه بعد از اطمینان از نصب پیش‌نیازها بر روی سیستم خود، مطابق مراحل ارائه شده در ادامه عمل نمایید.

### پیش‌نیازها
<div dir="rtl" align=right>

- پکیج [XAMPP](https://www.apachefriends.org/) یا سایر برنامه‌های مشابه جهت اجرای سرور مجازی، دیتابیس MySQL و پکیج زبان PHP
- پکیج منیجر [composer](https://getcomposer.org/)
</div>

### مراحل نصب

1- ابتدا از اتصال سرور و پایگاه داده مطمئن شوید.
(در برنامه xampp ماژول‌های apache و MySQL فعال شوند.


2-  وارد phpmyqdmin شده و یک دیتابیس به نام `laravel_mini_cms` بدون هیچ جدول و اطلاعاتی بسازید.

3- حال با دستور زیر برنامه را نصب نمایید.
```bash
composer create-project sepand/laravel-mini-cms
```

*در صورتی که نصب بدون هیچ گونه خطایی کامل شود، برنامه به درستی نصب شده است اما در حال حاظر جداول پایگاه داده خالی بوده و برنامه هیچ محتوایی ندارد. در صورتی که قصد دارید به صورت دستی محتوا اعم از حساب کاربری، دسته‌بندی محتوا، مطالب و کامنت درج نمایید، می‌توانید از مرحله بعد عبور کرده و مستقیماً به مرحله 5 بروید. در غیر این صورت می‌توانید اطلاعات فیک را به طور خودکار توسط پکیج `faker` لاراول ایجاد کنید.*

4- برای وارد کردن اطلاعات fake در جداول دیتابیس، دستور زیر را وارد نمایید.
این فرآیند ممکن است کمی زبان‌بر باشد.
```bash
 php artisan db:seed
 ```
زمانی که در ترمینال پیام `Database seeding completed successfully.` را مشاهده کردید، فرآیند ایجاد اطلاعات تکمیل شده است و می‌توانید از برنامه استفاده نمایید.

5- با دستور زیر وارد پوشه اصلی پروژه شوید.
```bash
cd .\laravel-mini-cms\
```
 6- با دستور زیر برنامه را اجرا نمایید.
 ```bash
php artisan serve
```

11- برای مشاهده بخش اصلی برنامه آدرس `localhost:8000` را در مرورگر وارد نمایید.

جهت مشاهده پنل مدیریت آدرس `http://localhost:8000/admin/dashboard` را در مرورگر وارد نمایید.
برای ورود به پنل ابتدا در صفحه `Sign Up` به آدرس `http://localhost:8000/register` یک اکانت ساخته و با ایمیل و رمزعبوری که تعریف کرده‌اید وارد پنل شوید.

</br>

## نصب توسط Docker
در صورتی که نصب Docker و کارکرد صحیح آن بر روی سیستم خود اطمینان دارید، مطابق راهنمای زیر عمل نمایید.

ابتدا فایل [laravel-mini-cms-dockerized.zip](https://github.com/SepandJP/laravel-mini-cms/raw/main/laravel-mini-cms-dockerized.zip)  را دانلود و Extract نمایید. سپس فایل `start.sh` را با دستور زیر اججرا نمایید.
```bash
bash start.sh
```
بعد از اتمام نصب، مانند بند 11 روش قبل عمل کرده و فقط port برنامه را به 5000 تغییر دهید.

*توجه داشته باشید که در هنگام نصب و build شدن، خطای عدم اتصال به دیتابیس mysql دریفات خواهید کرد که لازم نیست کاری کرده و باید آن را نادیده بگیرید.*

# پکیج‌های استفاده شده

- **[Laravel Breeze](https://laravel.com/docs/8.x/starter-kits#laravel-breeze)**
- **[Clean Blog](https://startbootstrap.com/theme/clean-blog)**
- **[Material Dashboard Bootstrap](https://www.creative-tim.com/learning-lab/bootstrap/overview/material-dashboard)**
