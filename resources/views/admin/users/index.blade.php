<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Users') }}
        </h2>
    </x-slot>

    @section('title')
    {{ 'Users' }}
    @endsection

    <x-slot name="main">
            <div class="container-fluid py-4">
              <div class="row">
                <div class="col-12">
                  <div class="card my-4">
                    <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                      <div class="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                        <h6 class="text-white text-capitalize ps-3">Authors table</h6>
                      </div>
                    </div>
                    <div class="card-body px-0 pb-2">
                      <div class="table-responsive p-0">

                          <x-auth-session-status class="alert-success" :status="__('add_user')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-warning" :status="__('edit_user')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-danger" :status="__('delete_user')" >
                          </x-auth-session-status>
                      
                        <table class="table align-items-center mb-0">
                          <thead>
                            <tr>
                              <th></th>
                              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">User</th>
                              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Roles</th>
                              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Email Status</th>
                              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Register Time</th>
                              <th class="text-secondary opacity-7"></th>
                            </tr>
                          </thead>
                          <tbody>

                            @foreach ($users as $user)
                            <tr>                              
                                <td>
                                  <img src="{{$user->photo_id ? $user->photo->path : "../images/img/Default_Avatar.jpg"}}" width="80">
                                </td>
                              <td>
                                <div class="d-flex px-2 py-1">
                                  <div class="d-flex flex-column justify-content-center">
                                    <h6 class="mb-0 text-sm">{{$user->name}}</h6>
                                    <p class="text-xs text-secondary mb-0">{{$user->email}}</p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <ul>
                                  @foreach ($user->roles as $role)
                                  <li class="text-xs text-secondary mb-0">{{$role->name}}</li>
                                  @endforeach
                                </ul>
                              </td>

                              @if ($user->email_verified_at != NULL)
                                <td class="align-middle text-center text-sm">
                                  <span class="badge badge-sm bg-gradient-success">Verified</span>
                                </td>
                                @else
                                <td class="align-middle text-center text-sm">
                                  <span class="badge badge-sm bg-gradient-secondary">Unverified</span>
                                </td>
                              @endif
                              
                              <td class="align-middle text-center">
                                <span class="text-secondary text-xs font-weight-bold">{{$user->created_at}}</span>
                              </td>
                              <td class="align-middle">
                                <a href="{{route('users.edit', $user->id)}}" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                                  Edit
                                </a>
                              </td>
                            </tr>
                            @endforeach
                           
                          </tbody>
                        </table>

                        <!-- Pagination -->
                    <div class="row">
                      <div class="col-12 h-100 d-flex justify-content-center">
                          Show
                          {{($users->currentPage()-1)* $users->perPage() + 1}}
                          to 
                          {{ ($users->currentPage()* $users->perPage()) }}
                          from   
                          {{ $users->total() }}
                          photos
                      </div>
                      <div class="col-12 d-flex justify-content-center">{{ $users->onEachSide(1)->links() }}</div>
                  </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    </x-slot>

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
</x-app-layout>
