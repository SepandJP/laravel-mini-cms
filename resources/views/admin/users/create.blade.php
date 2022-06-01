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
                <div class="container">
                    <div class="col-xl-6 col-lg-7 col-md-9 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-7">
                       
                                <x-auth-validation-errors>
                                </x-auth-validation-errors>
                                
                                <form role="form" method="POST" action="{{ route('users.store') }}" accept-charset="UTF-8" enctype="multipart/form-data">
                                    @csrf

                                    <!-- Name -->
                                    <x-label for="name" :value="__('Name')" />
                                    <x-field>
                                        <x-input id="name" type="text" name="name" :value="old('name')" required />
                                    </x-field>

                                    <!-- Email Address -->
                                    <x-label for="name" :value="__('Email')" />
                                    <x-field>
                                        <x-input id="email" type="email" name="email" :value="old('email')" required />
                                    </x-field>

                                    <!-- Roles -->
                                    {{-- <x-field class="mb-3"> --}}
                                        <x-label for="roles" :value="__('Roles')" />
                                        <select class="form-select" name="roles[]" id="roles" multiple aria-label="multiple select example" required>
                                                @foreach ($roles as $key => $value)
                                                    <option value="{{$key}}">{{$value}}</option>
                                                @endforeach
                                          </select>

                                    <!-- Profile Photo (Avatar) -->
                                    <x-label class="mt-5 mb-0 py-0" for="avatar" :value="__('Profile Photo')" />
                                    <x-field>
                                        <x-input id="avatar" type="file" name="avatar" accept="image/*"/>
                                    </x-field>

                                    <!-- Password -->
                                    <x-label for="name" :value="__('Password')" />
                                    <x-field class="mb-3">
                                        <x-input id="password" type="password" name="password" required autocomplete="new-password" />
                                    </x-field>

                                    <!-- Confirm Password -->
                                    <x-label for="name" :value="__('Confirm Password')" />
                                    <x-field class="mb-3">
                                        <x-input id="password_confirmation" type="password" name="password_confirmation" required />
                                    </x-field>

                                    <div class=" text-center pt-0 px-lg-2 px-1">
                                        <div class="text-center pt-0 px-lg-2 px-1">
                                            <x-button class="btn-lg btn-lg mt-4 mb-0">
                                                {{ __('Register') }}
                                            </x-button>
                                        </div>
                                    </div>
                                </form>
                    </div>
                </div>
                </div>

    </x-slot>

</x-app-layout>