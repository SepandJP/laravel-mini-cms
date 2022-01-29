<x-app-layout>

    @section('title')
        {{ 'New User' }}
    @endsection

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Create New User') }}
        </h2>
    </x-slot>

    <x-slot name="main">
            <section>
                <div class="page-header min-vh-100">
                <div class="container">
                    <div class="row">
                    <div class="col-6 d-lg-flex d-none h-100 my-auto pe-0 position-absolute top-0 start-0 text-center justify-content-center flex-column">
                        <div class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center" style="background-image: url('../admin/img/illustrations/illustration-signup.jpg'); background-size: cover;">
                        </div>
                    </div>
                    <div class="col-xl-6 col-lg-7 col-md-9 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-7">
                       
                                <x-auth-validation-errors>
                                </x-auth-validation-errors>
                                
                                <form role="form" method="POST" action="{{ route('users.store') }}">
                                    @csrf

                                    <!-- Name -->
                                    <x-field class="mb-3">
                                        <x-label for="name" :value="__('Name')" />

                                        <x-input id="name" type="text" name="name" :value="old('name')" required autofocus />
                                    </x-field>

                                    <!-- Email Address -->
                                    <x-field class="mb-3">
                                        <x-label for="email" :value="__('Email')" />

                                        <x-input id="email" type="email" name="email" :value="old('email')" required />
                                    </x-field>

                                    <!-- Roles -->
                                    {{-- <x-field class="mb-3"> --}}
                                        <x-label for="roles" :value="__('Roles')" />

                                        <select class="form-select" name="roles" id="roles" multiple aria-label="multiple select example" required>
                                                @foreach ($roles as $key => $value)
                                                    <option value="{{$key}}">{{$value}}</option>

                                                    {{-- <div class="form-check form-check-inline">
                                                        <input class="form-check-input" type="checkbox" name="roleCheckbox{{$key}}" id="roleCheckbox{{$key}}" value="{{$key}}">
                                                        <label class="form-check-label" for="roleCheckbox{{$key}}">{{$value}}</label>
                                                      </div> --}}
                                                @endforeach
                                          </select>
                                    {{-- </x-field> --}}

                                    
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
            </section>
    </x-slot>

</x-app-layout>