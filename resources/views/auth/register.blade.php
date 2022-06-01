<x-guest-layout>
    {{-- <x-auth-card> --}}
        {{-- <x-slot name="logo">
            <a href="/">
                <x-application-logo class="w-20 h-20 fill-current text-gray-500" />
            </a>
        </x-slot> --}}

        @section('title')
            Sign Up
        @endsection

        <!-- Validation Errors -->
        <x-auth-validation-errors class="mb-4" :errors="$errors" />

        @section('main')
            <section>
                <div class="page-header min-vh-100">
                <div class="container">
                    <div class="row">
                    <div class="col-6 d-lg-flex d-none h-100 my-auto pe-0 position-absolute top-0 start-0 text-center justify-content-center flex-column">
                        <div class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center" style="background-image: url('../admin/img/illustrations/illustration-signup.jpg'); background-size: cover;">
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-5 col-md-7 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-5">
                        <div class="card card-plain">
                        <div class="card-header">
                            <h4 class="font-weight-bolder">Sign Up</h4>
                            <p class="mb-0">Enter your email and password to register</p>
                        </div>
                            <div class="card-body">

                                <x-auth-validation-errors>
                                </x-auth-validation-errors>
                                
                                <form role="form" method="POST" action="{{ route('register') }}">
                                    @csrf

                                    <!-- Name -->
                                    <x-field class="mb-3">
                                        <x-label for="name" :value="__('Name')" />

                                        <x-input id="name" type="text" name="name" :value="old('name')" required />
                                    </x-field>

                                    <!-- Email Address -->
                                    <x-field class="mb-3">
                                        <x-label for="email" :value="__('Email')" />

                                        <x-input id="email" type="email" name="email" :value="old('email')" required />
                                    </x-field>

                                    <!-- Password -->
                                    <x-field class="mb-3">
                                        <x-label for="password" :value="__('Password')" />

                                        <x-input id="password"
                                                        type="password"
                                                        name="password"
                                                        required autocomplete="new-password" />
                                    </x-field>

                                    <!-- Confirm Password -->
                                    <x-field class="mb-3">
                                        <x-label for="password_confirmation" :value="__('Confirm Password')" />

                                        <x-input id="password_confirmation"
                                                        type="password"
                                                        name="password_confirmation" required />
                                    </x-field>

                                    <div class="card-footer text-center pt-0 px-lg-2 px-1">
                                        <p class="mb-2 text-sm mx-auto">
                                            <a class="text-primary text-gradient font-weight-bold" href="{{ route('login') }}">
                                                {{ __('Already registered?') }}
                                            </a>
                                        </p>

                                        <div class="card-footer text-center pt-0 px-lg-2 px-1">
                                            <x-button class="btn-lg btn-lg mt-4 mb-0">
                                                {{ __('Register') }}
                                            </x-button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </section>
        @endsection

        @section('scripts')
        <script>
            var win = navigator.platform.indexOf('Win') > -1;
            if (win && document.querySelector('#sidenav-scrollbar')) {
              var options = {
                damping: '0.5'
              }
              Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
            }
          </script>
        @endsection

    {{-- </x-auth-card> --}}
</x-guest-layout>
