<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @include('layouts.blog.head')
    </head>

    <body>

        @include('layouts.blog.navbar', ['categories' => $categories])

        @yield('header')

        @yield('main')
        
        <footer>
            @include('layouts.blog.footer')
        </footer>

    </body>
</html>
