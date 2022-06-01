<x-guest-layout>
    @section('title')
    {{ 'Log in' }}
    @endsection

        <!-- Validation Errors -->
        <x-auth-validation-errors class="mb-4" :errors="$errors" />

        {{-- <x-slot name="main"> --}}
        @section('main')

        <div class="page-header align-items-start min-vh-100" style="background-image: url('https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80');">
            <span class="mask bg-gradient-dark opacity-6"></span>
            <div class="container my-auto">
              <div class="row">
                <div class="col-lg-4 col-md-8 col-12 mx-auto">
                  <div class="card z-index-0 fadeIn3 fadeInBottom">
                    <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                      <div class="bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1">
                        <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">Sign in</h4>
                      </div>
                    </div>

            <div class="card-body">

              <x-auth-validation-errors>
              </x-auth-validation-errors>
              
                <form role="form" method="POST" action="{{ route('login') }}">
                    @csrf

                    <!-- Email Address -->
                    <x-field class="mb-3">
                        <x-label for="email" :value="__('Email')" />

                        <x-input id="email"  type="email" name="email" :value="old('email')" required />
                    </x-field>

                    <!-- Password -->
                    <x-field class="mb-3">
                        <x-label for="password" :value="__('Password')" />

                        <x-input id="password" 
                                        type="password"
                                        name="password"
                                        required autocomplete="current-password" />
                    </x-field>

                    <!-- Remember Me -->
                    <div class="form-check form-switch d-flex align-items-center mb-3">
                        <label for="remember_me" class="form-check-label mb-0 ms-2">
                            <input id="remember_me" type="checkbox" class="form-check-input" name="remember">
                            <span>{{ __('Remember me') }}</span>
                        </label>
                    </div>

                    <div class="flex items-center justify-end mt-4">
                        @if (Route::has('password.request'))
                            <a class="underline text-sm text-gray-600 hover:text-gray-900" href="{{ route('password.request') }}">
                                {{ __('Forgot your password?') }}
                            </a>
                        @endif

                        <x-button class="my-4 mb-2">
                            {{ __('Log in') }}
                        </x-button>

                        <p class="mt-4 text-sm text-center">
                            Don't have an account?
                            <a href="{{ route('register') }}" class="text-primary text-gradient font-weight-bold">Sign up</a>
                        </p>

                    </div>
                </form>
            </div>

                  </div>
                </div>
              </div>
            </div>

        {{-- </x-slot> --}}
        @endsection
    {{-- </x-auth-card> --}}


            @section('footer')
                @section('footer-style')
                  container footer position-absolute bottom-2 py-2 w-100
                @endsection
</x-guest-layout>
