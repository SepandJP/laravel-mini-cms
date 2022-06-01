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
                <div class="container">
                    <div class="row">
                        <!-- Index Image -->
                        <div class="col-md-3">
                            <img src="{{$user->photo_id ? $user->photo->path : "/images/img/Default_Avatar.jpg"}}" class="img-fluid">
                        </div>
                        <div class="col-xl-6 col-lg-7 col-md-9 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-7">
                        
                                    <x-auth-validation-errors>
                                    </x-auth-validation-errors>
                                    
                                    <form role="form" method="POST" action="{{ route('users.update', $user->id) }}" accept-charset="UTF-8" enctype="multipart/form-data">
                                        @csrf
                                        @method('PUT')

                                        <!-- Name -->
                                        <x-label for="name" :value="__('Name')" />
                                        <x-field class="mb-3">
                                            <x-input id="name" type="text" name="name" :value="$user->name" required />
                                        </x-field>

                                        <!-- Email Address -->
                                        <x-label for="email" :value="__('Email')" />
                                        <x-field class="mb-3">
                                            <x-input id="email" type="email" name="email" :value="$user->email" required />
                                        </x-field>

                                        <!-- Roles -->
                                            <x-label for="roles" :value="__('Roles')" />

                                            <select class="form-select" name="roles[]" id="roles" multiple aria-label="roles select" required>
                                                    @foreach ($roles as $key => $value)
                                                        <option value="{{$key}}" {{in_array($key, $selectedRoles) ? 'selected' : ''}}>{{$value}}</option>
                                                    @endforeach
                                            </select>

                                        <!-- Profile Photo (Avatar) -->
                                        <x-label class="mt-5" for="avatar" :value="__('Change Profile Photo')" />
                                        <x-field class="mb-3">
                                            <x-input id="avatar" type="file" name="avatar" accept="image/*"/>
                                        </x-field>

                                        <!-- Password -->
                                        <span class="badge bg-gradient-primary"><em>If you don't want to change the password, leave this section blank.</em></span>
                                        <x-label for="password" class="mt-5" :value="__('Password')" />
                                        <x-field class="mb-3">
                                            <x-input id="password" type="password" name="password" autocomplete="new-password" />
                                        </x-field>

                                        <!-- Confirm Password -->
                                        <x-label for="password_confirmation" :value="__('Confirm Password')" />
                                        <x-field class="mb-3">
                                            <x-input id="password_confirmation" type="password" name="password_confirmation"/>
                                        </x-field>

                                        <div class="text-center pt-0 px-lg-2 px-1">
                                            <div class="text-center pt-0 px-lg-2 px-1">
                                                <button class="btn bg-gradient-warning btn-lg btn-lg mt-4 mb-0">
                                                    {{ __('Edit') }}
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                    <!-- Delete User -->
                                    <form role="form" method="POST" action="{{ route('users.destroy', $user->id) }}">
                                        @csrf
                                        @method('DELETE')

                                        <div class="text-center pt-0 px-lg-2 px-1">
                                            <div class="text-center pt-0 px-lg-2 px-1">
                                                <button class="btn bg-gradient-danger btn-lg btn-lg mt-4 mb-0">
                                                    {{ __('Delete') }}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                        </div>
                    </div>
                </div>
            </section>
    </x-slot>

</x-app-layout>