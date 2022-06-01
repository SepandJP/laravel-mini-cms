<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @include('layouts.app-head')
    </head>
    <body class="g-sidenav-show  bg-gray-200">
        <div class="min-h-screen bg-gray-100">

            <div class="row">
                <!-- Page Heading -->
                <header class="">
                    <div class="d-flex flex-column align-items-end">
                        @include('layouts.navigation')
                    </div>
                    <div class="d-flex justify-content-center">
                        {{ $header }}
                    </div>
                </header>
            </div>


            <!-- Page Sidebar -->
            <aside class="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3   bg-gradient-dark" id="sidenav-main">
                @include('layouts.sidebar')
            </aside>

            <!-- Page Content -->
            <main class="main-content">
                {{ $main }}
            </main>

        </div>
        
        <footer>
            @include('layouts.app-footer')
        </footer>

    </body>
</html>
