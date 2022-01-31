<x-app-layout>

    @section('title')
        {{ 'New User' }}
    @endsection

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __("Edit User: $user->name") }}
        </h2>
    </x-slot>

    <x-slot name="main">
            <section>
                <div class="page-header min-vh-100">
                <div class="container">
                    <div class="row">
                    <div class="col-md-3">
                        <img src="{{$user->photo_id ? $user->photo->path : "/images/Default_Avatar.jpg"}}" class="img-fluid">
                    </div>
                    <div class="col-xl-6 col-lg-7 col-md-9 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-7">
                       
                                <x-auth-validation-errors>
                                </x-auth-validation-errors>
                                
                                <form role="form" method="POST" action="{{ route('users.update', $user->id) }}" accept-charset="UTF-8" enctype="multipart/form-data">
                                    @csrf
                                    @method('PUT')

                                    <!-- Name -->
                                    <x-field class="mb-3">
                                        <x-label for="name" :value="__('Name')" />

                                        <x-input id="name" type="text" name="name" :value="$user->name" required autofocus />
                                    </x-field>

                                    <!-- Email Address -->
                                    <x-field class="mb-3">
                                        <x-label for="email" :value="__('Email')" />

                                        <x-input id="email" type="email" name="email" :value="$user->email" required />
                                    </x-field>

                                    <!-- Roles -->
                                    {{-- <x-field class="mb-3"> --}}
                                        <x-label for="roles" :value="__('Roles')" />

                                        <select class="form-select" name="roles[]" id="roles" multiple aria-label="roles select" required>
                                                @foreach ($roles as $key => $value)
                                                    <option value="{{$key}}" {{in_array($key, $selectedRoles) ? 'selected' : ''}}>{{$value}}</option>

                                                    {{-- <div class="form-check form-check-inline">
                                                        <input class="form-check-input" type="checkbox" name="roleCheckbox{{$key}}" id="roleCheckbox{{$key}}" value="{{$key}}">
                                                        <label class="form-check-label" for="roleCheckbox{{$key}}">{{$value}}</label>
                                                      </div> --}}
                                                @endforeach
                                          </select>
                                    {{-- </x-field> --}}

                                    <!-- Profile Photo (Avatar) -->
                                    <x-field class="mb-3">
                                        <x-label for="avatar" :value="__('Profile Photo')" />

                                        <x-input id="avatar" type="file" name="avatar" accept="image/*"/>
                                    </x-field>

                                    <!-- Password -->
                                    <x-field class="mb-3">
                                        <x-label for="password" :value="__('Password')" />

                                        <x-input id="password"
                                                        type="password"
                                                        name="password"
                                                        autocomplete="new-password" />
                                    </x-field>

                                    <!-- Confirm Password -->
                                    <x-field class="mb-3">
                                        <x-label for="password_confirmation" :value="__('Confirm Password')" />

                                        <x-input id="password_confirmation"
                                                        type="password"
                                                        name="password_confirmation"/>
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