<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @include('layouts.app-head')
    </head>
    <body class="g-sidenav-show  bg-gray-200">
        <div class="min-h-screen bg-gray-100">

            <div class="row">
                <div class="col-3"></div>
                <div class="col-9">
                    @include('layouts.navigation')
                

                    <!-- Page Heading -->
                    <header class="bg-white shadow">
                        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {{ $header }}
                        </div>
                    </header>
                </div>
            </div>


            <!-- Page Sidebar -->
            <aside class="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3   bg-gradient-dark" id="sidenav-main">
                @include('layouts.sidebar')
            </aside>

            <!-- Page Content -->
            <main class="main-content mt-0">
                {{ $main }}
            </main>

            {{-- <!-- Other Sections -->
            <section>
                {{ $section }}
            </section> --}}

        </div>
        
        <footer>
            @include('layouts.app-footer')
        </footer>

    </body>
</html>
