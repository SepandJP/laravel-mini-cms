<x-app-layout>
    @section('title')
    {{ 'Dashboard' }}
    @endsection
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <x-slot name="main">
      {{-- Main Section --}}

        <div class="container-fluid py-4">
          <div class="row">
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
              <div class="card">
                <div class="card-header p-3 pt-2">
                  <div class="icon icon-lg icon-shape bg-gradient-dark shadow-dark text-center border-radius-xl mt-n4 position-absolute">
                    <i class="material-icons opacity-10">description</i>
                  </div>
                  <div class="text-end pt-1">
                    <p class="text-sm mb-0 text-capitalize">Count of Posts</p>
                    <h4 class="mb-0">{{ $postsCount }}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
              <div class="card">
                <div class="card-header p-3 pt-2">
                  <div class="icon icon-lg icon-shape bg-gradient-primary shadow-primary text-center border-radius-xl mt-n4 position-absolute">
                    <i class="material-icons opacity-10">people</i>
                  </div>
                  <div class="text-end pt-1">
                    <p class="text-sm mb-0 text-capitalize">Count of Users</p>
                    <h4 class="mb-0">{{ $postsCount }}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
              <div class="card">
                <div class="card-header p-3 pt-2">
                  <div class="icon icon-lg icon-shape bg-gradient-success shadow-success text-center border-radius-xl mt-n4 position-absolute">
                    <i class="material-icons opacity-10">category</i>
                  </div>
                  <div class="text-end pt-1">
                    <p class="text-sm mb-0 text-capitalize">Count of Categories</p>
                    <h4 class="mb-0">{{ $categoriesCount }}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-sm-6">
              <div class="card">
                <div class="card-header p-3 pt-2">
                  <div class="icon icon-lg icon-shape bg-gradient-info shadow-info text-center border-radius-xl mt-n4 position-absolute">
                    <i class="material-icons opacity-10">perm_media</i>
                  </div>
                  <div class="text-end pt-1">
                    <p class="text-sm mb-0 text-capitalize">Count of Medias</p>
                    <h4 class="mb-0">{{ $photosCount }}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Latest Posts and Users -->
          <div class="container px-0 mx-0">
            <div class="row py-3">

              <!-- Latest Posts -->
              <div class="g-0 col-xxl-7">
                <h2 class="py-3">Latest Posts</h2>
                <table class="table align-items-center">
                  <thead>
                    <tr>
                      <th class="text-center text-uppercase text-s font-weight-bolder w-25">Title</th>
                      <th class="text-center text-uppercase text-s font-weight-bolder w-25">Category</th>
                      <th class="text-center text-uppercase text-s font-weight-bolder w-25">Create time</th>
                      <th class="text-center text-uppercase text-s font-weight-bolder w-25">Status</th>
                    </tr>
                  </thead>
                  <tbody>

                    @foreach ($posts as $post)
                    <tr>    

                      <td>
                        <div class="d-flex w-25">
                          <div class="d-flex flex-column justify-content-center">
                            <h6 class="mb-0 text-sm"><a href="{{route('posts.edit', $post->id)}}">{{Str::limit($post->title, 30)}}</a></h6>
                            <a href="{{ route('users.edit', $post->user->id) }}" class="text-xs text-secondary mb-0">{{$post->user->name}}</a>
                          </div>
                        </div>
                      </td>

                      <div class="w-25">
                      <td class="align-middle text-center w-25">
                        <a href="{{ route('categories.edit', $post->category->id) }}" class="text-center text-secondary text-xs font-weight-bold">{{$post->category->title}}</a>
                      </td>
                      </div>
                    
                      <div class="w-25">
                      <td class="align-middle text-center w-25">
                        <span class="text-center text-secondary text-xs font-weight-bold">{{$post->created_at}}</span>
                      </td>
                    </div>

                    <div class="w-25">
                      @if ($post->status == 1)
                      <td class="align-middle text-center text-sm w-25">
                        <span class="badge badge-sm bg-gradient-success">Active</span>
                      </td>
                      @else
                      <td class="align-middle text-center text-sm w-25">
                        <span class="badge badge-sm bg-gradient-secondary">Inactive</span>
                      </td>
                      @endif
                    </div>

                    </tr>
                    @endforeach
                  
                  </tbody>
                </table>
              </div>

              <!-- Latest Users -->
              <div class="col-xxl-5">
                <h2 class="py-3">Latest Users</h2>
                <table class="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th class="text-center text-uppercase text-secondary text-s font-weight-bolder w-25">User</th>
                      <th class="text-center text-uppercase text-secondary text-s font-weight-bolder w-25 px-0 mx-0">Email Status</th>
                      <th class="text-center text-uppercase text-secondary text-s font-weight-bolder w-25">Register Time</th>
                    </tr>
                  </thead>
                  <tbody>

                    @foreach ($users as $user)
                    <tr> 
                      <div class="w-25">                             
                        <td>
                          <div class="d-flex px-2 py-1">
                            <div class="d-flex flex-column justify-content-center">
                              <h6 class="mb-0 text-sm">{{$user->name}}</h6>
                              <p class="text-xs text-secondary mb-0">{{$user->email}}</p>
                            </div>
                          </div>
                        </td>
                    </div>

                    <div class="w-25">
                      @if ($user->email_verified_at != NULL)
                        <td class="align-middle text-center text-sm">
                          <span class="badge badge-sm bg-gradient-success">Verified</span>
                        </td>
                        @else
                        <td class="align-middle text-center text-sm">
                          <span class="badge badge-sm bg-gradient-secondary">Unverified</span>
                        </td>
                      @endif
                    </div>
                      
                    <div class="w-25">
                      <td class="align-middle text-center">
                        <span class="text-secondary text-xs font-weight-bold">{{$user->created_at}}</span>
                      </td>
                    </div>
                    </tr>
                    @endforeach
                   
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>
      {{-- End of Main Section --}}
    </x-slot>


        @section('scripts')
        <script>
            var ctx = document.getElementById("chart-bars").getContext("2d");
        
            new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["M", "T", "W", "T", "F", "S", "S"],
                datasets: [{
                label: "Sales",
                tension: 0.4,
                borderWidth: 0,
                borderRadius: 4,
                borderSkipped: false,
                backgroundColor: "rgba(255, 255, 255, .8)",
                data: [50, 20, 10, 22, 50, 10, 40],
                maxBarThickness: 6
                }, ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                legend: {
                    display: false,
                }
                },
                interaction: {
                intersect: false,
                mode: 'index',
                },
                scales: {
                y: {
                    grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [5, 5],
                    color: 'rgba(255, 255, 255, .2)'
                    },
                    ticks: {
                    suggestedMin: 0,
                    suggestedMax: 500,
                    beginAtZero: true,
                    padding: 10,
                    font: {
                        size: 14,
                        weight: 300,
                        family: "Roboto",
                        style: 'normal',
                        lineHeight: 2
                    },
                    color: "#fff"
                    },
                },
                x: {
                    grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [5, 5],
                    color: 'rgba(255, 255, 255, .2)'
                    },
                    ticks: {
                    display: true,
                    color: '#f8f9fa',
                    padding: 10,
                    font: {
                        size: 14,
                        weight: 300,
                        family: "Roboto",
                        style: 'normal',
                        lineHeight: 2
                    },
                    }
                },
                },
            },
            });
        
        
            var ctx2 = document.getElementById("chart-line").getContext("2d");
        
            new Chart(ctx2, {
            type: "line",
            data: {
                labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                label: "Mobile apps",
                tension: 0,
                borderWidth: 0,
                pointRadius: 5,
                pointBackgroundColor: "rgba(255, 255, 255, .8)",
                pointBorderColor: "transparent",
                borderColor: "rgba(255, 255, 255, .8)",
                borderColor: "rgba(255, 255, 255, .8)",
                borderWidth: 4,
                backgroundColor: "transparent",
                fill: true,
                data: [50, 40, 300, 320, 500, 350, 200, 230, 500],
                maxBarThickness: 6
        
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                legend: {
                    display: false,
                }
                },
                interaction: {
                intersect: false,
                mode: 'index',
                },
                scales: {
                y: {
                    grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [5, 5],
                    color: 'rgba(255, 255, 255, .2)'
                    },
                    ticks: {
                    display: true,
                    color: '#f8f9fa',
                    padding: 10,
                    font: {
                        size: 14,
                        weight: 300,
                        family: "Roboto",
                        style: 'normal',
                        lineHeight: 2
                    },
                    }
                },
                x: {
                    grid: {
                    drawBorder: false,
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false,
                    borderDash: [5, 5]
                    },
                    ticks: {
                    display: true,
                    color: '#f8f9fa',
                    padding: 10,
                    font: {
                        size: 14,
                        weight: 300,
                        family: "Roboto",
                        style: 'normal',
                        lineHeight: 2
                    },
                    }
                },
                },
            },
            });
        
            var ctx3 = document.getElementById("chart-line-tasks").getContext("2d");
        
            new Chart(ctx3, {
            type: "line",
            data: {
                labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                label: "Mobile apps",
                tension: 0,
                borderWidth: 0,
                pointRadius: 5,
                pointBackgroundColor: "rgba(255, 255, 255, .8)",
                pointBorderColor: "transparent",
                borderColor: "rgba(255, 255, 255, .8)",
                borderWidth: 4,
                backgroundColor: "transparent",
                fill: true,
                data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
                maxBarThickness: 6
        
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                legend: {
                    display: false,
                }
                },
                interaction: {
                intersect: false,
                mode: 'index',
                },
                scales: {
                y: {
                    grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [5, 5],
                    color: 'rgba(255, 255, 255, .2)'
                    },
                    ticks: {
                    display: true,
                    padding: 10,
                    color: '#f8f9fa',
                    font: {
                        size: 14,
                        weight: 300,
                        family: "Roboto",
                        style: 'normal',
                        lineHeight: 2
                    },
                    }
                },
                x: {
                    grid: {
                    drawBorder: false,
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false,
                    borderDash: [5, 5]
                    },
                    ticks: {
                    display: true,
                    color: '#f8f9fa',
                    padding: 10,
                    font: {
                        size: 14,
                        weight: 300,
                        family: "Roboto",
                        style: 'normal',
                        lineHeight: 2
                    },
                    }
                },
                },
            },
            });
        </script>
        
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
