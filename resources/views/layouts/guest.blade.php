<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @include('layouts.app-head')
    </head>
    <body class="">
        

            <!-- Navbar -->
            <div class="container position-sticky z-index-sticky top-0 d-flex justify-content-center">
                <nav class="col-12 col-md-6 navbar navbar-expand-lg blur border-radius-xl top-0 z-index-3 shadow position-absolute my-3 py-2 ">
                    @include('layouts.navbar-guest')
                </nav>
                <!-- End Navbar -->
            </div>

            <!-- Page Content -->
            <main class="main-content mt-0">
                {{-- {{ $main }} --}}
                @yield('main')
            </main>
        
        <footer class="@yield('footer-style')">
            @include('layouts.app-footer')
        </footer>

    </body>
</html>
