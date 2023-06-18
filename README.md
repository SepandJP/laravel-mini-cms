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
برای نصب برنامه بعد از اطمینان از نصب پیش‌نیازها بر روی سیستم خود، مطابق مراحل ارائه شده در ادامه عمل نمایید.

## پیش‌نیازها
<div dir="rtl" align=right>

- پکیج [XAMPP](https://www.apachefriends.org/) یا سایر برنامه‌های مشابه جهت اجرای سرور مجازی، دیتابیس MySQL و پکیج زبان PHP
- پکیج منیجر [composer](https://getcomposer.org/)
</div>

## مراحل نصب

1- ابتدا با دستور زیر سورس کد را `clone` نمایید.
```bash
git clone https://github.com/SepandJP/laravel-mini-cms.git
```

2- سپس با دستور زیر وارد پوشه اصلی پروژه شوید.
```bash
cd .\laravel-mini-cms\
```

3- حال با دستور زیر پکیج‌های موردنیاز رو نصب نمایید.

*باتوجه به شرایط اینترنت، این مرحله ممکن است کمی زمان‌بر باشد.*
```bash
composer install
```

4- به دلیل استفاده از پکیج‌های گوناگون و همچنین بروزرسانی پیوسته آن‌ها، ممکن است برخی از پکیج‌ها نیاز به تغییر نسخه و بروزرسانی داشته باشد در غیر این صورت برنامه به درستی کار نکند. به همین دلیل با دستور زیر پکیج‌های نصب شده را بروزرسانی نمایید.

*باتوجه به شرایط اینترنت، این مرحله ممکن است کمی زمان‌بر باشد.*
```bash
composer update
```

5- با دستور زیر متغیرهای موردنیاز برای اجرای برنامه را کپی نمایید.
```bash
cp .env.example .env
```

6-  یک دیتابیس به نام `laravel_mini_cms` بدون هیچ جدول و اطلاعاتی بسازید.

7- جهت ساخت tableهای دیتابیس دستور زیر را وارد نمایید.
```bash
php artisan migrate
```

8- برای وارد کردن اطلاعات fake در جداول دیتابیس، دستور زیر را وارد نمایید.
```bash
 php artisan db:seed
 ```

 9- با دستور زیر برنامه را اجرا نمایید.
 ```bash
php artisan serve
```

10- لاراول برای اجرا نیاز به کلید رمزنگاری شده دارد. بدین منظور لازم است دستور زیر را وارد نمایید.
```bash
php artisan key:generate
```

11- برای مشاهده بخش اصلی برنامه آدرس `localhost:8000` را در مرورگر وارد نمایید.

جهت مشاهده پنل مدیریت آدرس `http://localhost:8000/admin/dashboard` را در مرورگر وارد نمایید.
برای ورود به پنل ابتدا در صفحه `Sign Up` به آدرس `http://localhost:8000/register` یک اکانت ساخته و با ایمیل و رمزعبوری که تعریف کرده‌اید وارد پنل شوید.

</br>

# پکیج‌های استفاده شده

- **[Laravel Breeze](https://laravel.com/docs/8.x/starter-kits#laravel-breeze)**
- **[Clean Blog](https://startbootstrap.com/theme/clean-blog)**
- **[Material Dashboard Bootstrap](https://www.creative-tim.com/learning-lab/bootstrap/overview/material-dashboard)**
