@foreach ($comments as $comment)
    @if ($comment->status == 1)
        <div class="row">
            <div class="d-flex flex-start">
                @if ($comment->user_id)
                    <img
                        class="rounded-circle shadow-1-strong me-3"
                        src="{{ asset($comment->user->photo->path ) }}"
                        alt="avatar"
                        width="65"
                        height="65"
                    />
                @else
                    <img
                        class="rounded-circle shadow-1-strong me-3"
                        src="{{ asset('images/img/Default_Avatar.jpg') }}"
                        alt="avatar"
                        width="65"
                        height="65"
                    />
                @endif
                <div class="flex-grow-1 flex-shrink-1">
                    <div>
                        <div class="d-flex justify-content-between align-items-center">
                        <p class="blockquote-footer my-0">
                            @if ($comment->user_id)
                                <a href="{{ route('show.user', $comment->user->id) }}">{{ $comment->user->name }}</a>
                            @elseif ($comment->user_name)
                                {{ $comment->user_name }}
                            @else
                                Guest
                            @endif
                            <span class="small">
                                - {{ $comment->created_at }}
                            </span>
                        </p>
                            <a href="#!" id="replyComment{{$comment->id}}" onclick="displayReplyBox(this)">
                                <i   class="fas fa-reply fa-xs">
                                    reply
                                </i>
                            </a>

                        </div>
                        <p class="mb-5 mt-0">
                            {{ $comment->description }}

                                <div id="replyComment{{$comment->id}}Div" class="replyCommentSection d-flex flex-start pt-0 mt-0 pb-5 mb-5" style="display: none !important">
                                    @if ( Auth::user() )
                                        <img
                                        class="rounded-circle shadow-1-strong me-3"
                                        src="{{ asset(Auth::user()->photo->path ) }}"
                                        alt="avatar"
                                        width="40"
                                        height="40"
                                        />
                                    @else
                                    <img
                                        class="rounded-circle shadow-1-strong me-3"
                                        src="{{ asset('images/img/Default_Avatar.jpg') }}"
                                        alt="avatar"
                                        width="40"
                                        height="40"
                                    />
                                    @endif
                                        <form id="replyComment{{$comment->id}}Form" class="form-floating  w-100" method="POST" action="{{ route('comment.reply') }}">
                                            @csrf
                                            
                                            <x-input type="hidden" value="{{$comment->id}}" name="parentId" />
                                            <x-input type="hidden" value="{{$post->id}}" name="postId" />

                                            <x-field>
                                                @if (Auth::user())
                                                    <x-input type="text" id="userName" name="name" placeholder="Your name" value="{{Auth::user()->name}}" :disabled="true" />
                                                @else
                                                    <x-input type="text" id="userName" name="name" placeholder="Your name" />
                                                @endif
                                                <x-label for="userName" :value="__('Post Comment as ')" />
                                            </x-field>
                                            
                                            <x-field>
                                                <textarea
                                                    required
                                                    name="description"
                                                    class="form-control"
                                                    placeholder="Leave a comment here"
                                                    id="replyComment{{$comment->id}}"
                                                    style="height: 100px"
                                                ></textarea>
                                                <x-label for="replyComment{{$comment->id}}Box" :value="__('Leave a comment here...')" />
                                            </x-field>

                                            <button type="submit" class="float-end mt-2 pt-1 btn btn-primary btn-sm">Post reply</button>
                                            <button type="button" class="float-end mx-2 mt-2 pt-1 btn btn-outline-primary btn-sm" onclick="hideReplyCommentSection(this)">Cancel</button>
                                        </form>
                                </div>

                                @includeIf('layouts.blog.comments', ['comments' => $comment->replies])
                        </p>
                    </div>
                </div>
            </div>
        </div>
    @endif
@endforeach

@section('scripts')
    <script>
        function hideReplyCommentSection(element)
        {
            let replyCommentSection = element.parentElement.parentElement;
            replyCommentSection.style.cssText = 'display: none !important';
        }

        function displayReplyBox(element)
        {
            let replyCommentSectionMustHidden = document.querySelector('.replyCommentSection');
            replyCommentSectionMustHidden.style.cssText = 'display: none !important';

            let commentReplyId = element.id;
            let replyCommentDivId = commentReplyId + 'Div';
            let replyCommentDiv = document.getElementById(replyCommentDivId);
            replyCommentDiv.style.cssText = 'display: block !important';
        }
    </script>
@endsection
