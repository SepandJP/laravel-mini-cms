<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @include('layouts.app-head')
    </head>
    <body class="">
        

            <!-- Navbar -->
            <div class="container position-sticky z-index-sticky top-0">
                <div class="row">
                    <div class="col-12">
                        <nav class="navbar navbar-expand-lg blur border-radius-xl top-0 z-index-3 shadow position-absolute my-3 py-2 start-0 end-0 mx-4">
                            @include('layouts.navbar-guest')
                        </nav>
                        <!-- End Navbar -->
                    </div>
                </div>
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
