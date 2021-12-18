<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @include('layouts.head')
    </head>
    <body class="g-sidenav-show  bg-gray-200">
        <div class="min-h-screen bg-gray-100">
{{-- 
            @include('layouts.navigation')

            <!-- Page Heading -->
            <header class="bg-white shadow">
                <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {{ $header }}
                </div>
            </header>
 --}}
            <!-- Page Sidebar -->
            <aside class="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3   bg-gradient-dark" id="sidenav-main">
                {{ $aside }}
            </aside>

            <!-- Page Content -->
            <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                {{ $slot }}
            </main>

            <!-- Other Sections -->
            <section>
                {{ $section }}
            </section>

        </div>

            @include('layouts.footer')

    </body>
</html>
