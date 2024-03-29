<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>roolith CSS framework</title>

    <!-- <link rel="stylesheet" href="dist/css/roolith.css?v=<?= time() ?>"> -->
    <link rel="stylesheet" href="dist/css/roolith-dark.css?v=<?= time() ?>">
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
    <style>
        .box-demo { width: 100%; background-color: #ddd; padding: 10px; margin-bottom: 20px; text-align: center; border-radius: 2px; font-size: 80%; }
        .box-demo-collage { width: 100%; height: 100%; background-color: #ddd; border-radius: 0; display: flex; justify-content: center; align-items: center; }
    </style>
</head>
<body class="theme-dark">
    <div class="container">

        <br><br>

        <!-- <h1>Heading</h1>
        <h2>Heading</h2>
        <h3>Heading</h3>
        <h4>Heading</h4>
        <h5>Heading</h5>
        <h6>Heading</h6>

        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat maxime velit voluptatibus doloribus
        ad accusantium necessitatibus eos explicabo inventore eligendi quam beatae,
        expedita. Impedit quae, amet autem nihil perspiciatis. Impedit.</p>

        <p>
            <strong>Bolded</strong>
            <em>Italicized</em>
            <a>Colored</a>
            <u>Underlined</u>
            <code>code</code>
            <abbr title="Too long; didn't read">TLDR</abbr>
            <kbd>Ctrl+R</kbd>
        </p>

        <br><br> -->


        <!-- <aside class="toast-notification bottom">
            <div class="message"><button class="message-close center">✖</button> Sucessfully updated! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo cupiditate doloribus eum atque iure architecto illum repellendus iste. Voluptate ab ipsa numquam odit ea, debitis ex quas fugiat vel quae!</div>
            <div class="message message-primary"><button class="message-close center">✖</button> Another notification</div>
        </aside> -->

        <!-- <div class="column">

            <div class="comment-group">
                <div class="comment">
                    <div class="avatar avatar-small">
                        <figure class="avatar-fig rounded">
                            <img src="https://picsum.photos/40/40?image=500" alt="">
                        </figure>
                        <a href="#" class="avatar-label">Killmonger
                            <span>@killmonger</span>
                        </a>
                    </div>
                    <div class="comment-body">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim asperiores repellat officiis! Labore expedita libero vitae omnis vel ab, blanditiis ea sit delectus tenetur assumenda quo placeat quaerat voluptate id.
                    </div>
                    <div class="comment-info">23 min ago</div>
                    <ul class="comment-action">
                        <li class="comment-action-item"><span>2 likes</span> <a href="#" class="comment-action-item-link"><i class="ion-thumbsup"></i> Like</a></li>
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link"><i class="ion-reply"></i> Reply</a></li>
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link"><i class="ion-android-share-alt"></i> Share</a></li>
                    </ul>
                </div>

                <div class="comment comment-indent-1">
                    <div class="avatar avatar-small">
                        <figure class="avatar-fig rounded">
                            <img src="https://picsum.photos/40/40?image=500" alt="">
                        </figure>
                        <a href="#" class="avatar-label">Killmonger
                            <span>@killmonger</span>
                        </a>
                    </div>
                    <div class="comment-body">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim asperiores repellat officiis! Labore expedita libero vitae omnis vel ab, blanditiis ea sit delectus tenetur assumenda quo placeat quaerat voluptate id.
                    </div>
                    <div class="comment-info">23 min ago</div>
                    <ul class="comment-action">
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link color-success"><i class="ion-arrow-up-b"></i> 22</a></li>
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link color-danger"><i class="ion-arrow-down-b"></i> 5</a></li>
                    </ul>
                </div>

                <div class="comment">
                    <div class="avatar avatar-small">
                        <figure class="avatar-fig rounded">
                            <img src="https://picsum.photos/40/40?image=500" alt="">
                        </figure>
                        <a href="#" class="avatar-label">Killmonger
                            <span>@killmonger</span>
                        </a>
                    </div>
                    <div class="comment-body">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim asperiores repellat officiis! Labore expedita libero vitae omnis vel ab, blanditiis ea sit delectus tenetur assumenda quo placeat quaerat voluptate id.
                    </div>
                    <div class="comment-info">23 min ago</div>
                    <ul class="comment-action">
                        <li class="comment-action-item"><span>2 likes</span> <a href="#" class="comment-action-item-link">Like</a></li>
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link">Reply</a></li>
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link">Share</a></li>
                    </ul>
                    <div class="comment-info">James, Christina and 3 others likes this</div>
                </div>

                <div class="comment comment-indent-1">
                    <div class="avatar avatar-small">
                        <figure class="avatar-fig rounded">
                            <img src="https://picsum.photos/40/40?image=500" alt="">
                        </figure>
                        <a href="#" class="avatar-label">Killmonger
                            <span>@killmonger</span>
                        </a>
                    </div>
                    <div class="comment-body">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim asperiores repellat officiis! Labore expedita libero vitae omnis vel ab, blanditiis ea sit delectus tenetur assumenda quo placeat quaerat voluptate id.
                    </div>
                    <div class="comment-info">23 min ago</div>
                    <ul class="comment-action">
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link color-success"><i class="ion-arrow-up-b"></i> 22</a></li>
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link color-danger"><i class="ion-arrow-down-b"></i> 5</a></li>
                    </ul>
                </div>

                <div class="comment comment-indent-2 comment-blurred">
                    <div class="avatar avatar-small">
                        <figure class="avatar-fig rounded">
                            <img src="https://picsum.photos/40/40?image=500" alt="">
                        </figure>
                        <a href="#" class="avatar-label">Killmonger
                            <span>@killmonger</span>
                        </a>
                    </div>
                    <div class="comment-body">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim asperiores repellat officiis! Labore expedita libero vitae omnis vel ab, blanditiis ea sit delectus tenetur assumenda quo placeat quaerat voluptate id.
                    </div>
                    <div class="comment-info">23 min ago</div>
                    <ul class="comment-action">
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link color-success"><i class="ion-arrow-up-b"></i> 5</a></li>
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link color-danger"><i class="ion-arrow-down-b"></i> 40</a></li>
                    </ul>
                </div>

                <div class="comment comment-highlight">
                    <div class="avatar avatar-small">
                        <figure class="avatar-fig rounded">
                            <img src="https://picsum.photos/40/40?image=500" alt="">
                        </figure>
                        <a href="#" class="avatar-label">Killmonger
                            <span>@killmonger</span>
                        </a>
                    </div>
                    <div class="comment-body">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim asperiores repellat officiis! Labore expedita libero vitae omnis vel ab, blanditiis ea sit delectus tenetur assumenda quo placeat quaerat voluptate id.
                    </div>
                    <div class="comment-info">23 min ago</div>
                    <ul class="comment-action">
                        <li class="comment-action-item"><span>2 likes</span> <a href="#" class="comment-action-item-link">Like</a></li>
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link">Reply</a></li>
                        <li class="comment-action-item"><a href="#" class="comment-action-item-link">Share</a></li>
                    </ul>
                    <div class="comment-info">James, Christina and 3 others likes this</div>
                </div>

                <br><br>
                <a href="" class="button button-small">Show more 20 replies</a>
            </div>

        </div> -->

        <!-- <div class="column">

            <div class="page page-normal">
                <div class="page-content">
                    <div class="page-icon color-success"><i class="ion-ios-checkmark"></i></div>
                    <h2 class="page-header color-success">Success</h2>
                    <div class="page-body">Thank you for your time! We shall keep you posted.</div>
                    <div class="page-footer">Another additional note</div>
                </div>
            </div>

            <div class="page">
                <div class="page-content">
                    <div class="page-icon color-danger"><i class="ion-alert-circled"></i></div>
                    <h2 class="page-header color-danger">404</h2>
                    <div class="page-body">Sorry, the page you are looking for, doesn't exist or removed from server!</div>
                    <div class="page-footer">404 page example</div>
                </div>
            </div>

        </div> -->

        <!-- <div class="column">
            <div class="form-field">
                <input type="text" name="" class="form-input" placeholder="Add tags">

                <div class="tags">
                    <span class="tag">HTML5 <i class="tag-close">✖</i></span>
                    <span class="tag">JavaScript <i class="tag-close">✖</i></span>
                    <span class="tag">PHP <i class="tag-close">✖</i></span>
                    <span class="tag">MySql <i class="tag-close">✖</i></span>
                </div>
            </div>

            <hr>

            <span class="tag">HTML5 <i class="tag-close">✖</i></span> <span class="tag">JavaScript</span> <span class="tag">PHP</span> <span class="tag">MySql</span>
        </div> -->

        <!-- <div class="row">
            <div class="columns large-6 large-offset-3">

                <form action="./" class="form">
                    <div class="form-field form-field-search loading hint">
                        <i class="form-field-search-icon ion-search"></i>
                        <input type="text" name="" class="form-input" placeholder="Search ...">
                        <i class="form-field-search-loading-icon"></i>

                        <div class="form-field-search-hint">
                            <ul>
                                <li><a href="#">Afganistan</a></li>
                                <li><a href="#">Srilanka <span class="badge badge-info">new</span></a></li>
                                <li><a href="#">Bangladesh</a></li>
                                <li><a href="#">United state</a></li>
                            </ul>
                        </div>
                    </div>

                    <br><br><br><br><br><br><br><br><br><br>

                    <div class="form-field form-field-search large loading hint">
                        <i class="form-field-search-icon ion-search"></i>
                        <input type="text" name="" class="form-input" placeholder="Search ...">
                        <i class="form-field-search-loading-icon"></i>

                        <div class="form-field-search-hint">
                            <ul>
                                <li><a href="#">Afganistan</a></li>
                                <li><a href="#">Srilanka <span class="badge badge-info">new</span></a></li>
                                <li><a href="#">Bangladesh</a></li>
                                <li><a href="#">United state</a></li>
                            </ul>
                        </div>
                    </div>

                    <br><br><br><br><br><br><br><br><br><br>

                    <div class="form-field form-field-search small loading hint">
                        <i class="form-field-search-icon ion-search"></i>
                        <input type="text" name="" class="form-input" placeholder="Search ...">
                        <i class="form-field-search-loading-icon"></i>

                        <div class="form-field-search-hint">
                            <ul>
                                <li><a href="#">Afganistan</a></li>
                                <li><a href="#">Srilanka <span class="badge badge-info">new</span></a></li>
                                <li><a href="#">Bangladesh</a></li>
                                <li><a href="#">United state</a></li>
                            </ul>
                        </div>
                    </div>

                    <br><br><br><br><br><br><br><br><br><br><br><br><br><br>

                </form>

            </div>
        </div> -->

        <!-- <div class="column">

            <div class="avatar avatar-small">
                <figure class="avatar-fig rounded">
                    <img src="https://picsum.photos/40/40?image=500" alt="">
                </figure>
                <a href="#" class="avatar-label">Killmonger <span>@killmonger</span></a>
            </div>

            <hr>

            <div class="avatar">
                <figure class="avatar-fig rounded">
                    <img src="https://picsum.photos/40/40?image=500" alt="">
                </figure>
                <a href="#" class="avatar-label">Killmonger <span>@killmonger</span></a>
                <div class="avatar-primary-block">
                    <span>Uncollected</span>
                    <a href="#">22k followers</a>
                    <a href="#">1k following</a>
                </div>
                <div class="avatar-secondary-block">
                    last seen 43 min ago
                </div>
            </div>

            <hr>

            <div class="avatar">
                <figure class="avatar-fig rounded-circle">
                    <img src="https://picsum.photos/40/40?image=500" alt="">
                </figure>
                <a href="#" class="avatar-label">Killmonger <span>@killmonger</span></a>
                <div class="avatar-primary-block">
                    <span>Uncollected</span>
                    <a href="#">22k followers</a>
                    <a href="#">1k following</a>
                </div>
                <div class="avatar-secondary-block">
                    last seen 43 min ago
                </div>
            </div>

        </div> -->

        <!-- <div class="column">

            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima nihil aliquam dolore voluptatum facere expedita quidem atque neque deserunt consequuntur explicabo, eligendi labore veritatis aperiam dicta, dolorem reiciendis nesciunt quasi!</p>

            <br><br>

            <section class="collage">
                <div class="collage-item"><img class="fig-fit" src="https://picsum.photos/200/200?image=10" alt=""></div>
                <div class="collage-item collage-item-big">
                    <figure class="collage-fig">
                        <img class="fig-fit" src="https://picsum.photos/400/400?image=11" alt="">
                        <figcaption class="collage-fig-caption visible">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</figcaption>
                    </figure>
                </div>
                <div class="collage-item"><img class="fig-fit" src="https://picsum.photos/200/200?image=13" alt=""></div>
                <div class="collage-item"><img class="fig-fit" src="https://picsum.photos/200/200?image=14" alt=""></div>
                <div class="collage-item collage-item-wide">
                    <figure class="collage-fig">
                        <img class="fig-fit" src="https://picsum.photos/400/400?image=15" alt="">
                        <figcaption class="collage-fig-caption visible">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</figcaption>
                    </figure>
                </div>
                <div class="collage-item"><img class="fig-fit" src="https://picsum.photos/200/200?image=16" alt=""></div>
                <div class="collage-item"><img class="fig-fit" src="https://picsum.photos/200/200?image=17" alt=""></div>
                <div class="collage-item collage-item-tall"><img class="fig-fit" src="https://picsum.photos/200/400?image=18" alt=""></div>
                <div class="collage-item"><img class="fig-fit" src="https://picsum.photos/200/200?image=19" alt=""></div>
                <div class="collage-item"><img class="fig-fit" src="https://picsum.photos/200/200?image=110" alt=""></div>
                <div class="collage-item"><img class="fig-fit" src="https://picsum.photos/200/200?image=111" alt=""></div>
                <div class="collage-item"><img class="fig-fit" src="https://picsum.photos/200/200?image=112" alt=""></div>
                <div class="collage-item">
                    <figure class="collage-fig">
                        <img class="fig-fit" src="https://picsum.photos/200/200?image=113" alt="">
                        <figcaption class="collage-fig-caption">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</figcaption>
                    </figure>
                </div>
            </section>

            <br><br>

            <section class="collage collage-small-gap">
                <div class="collage-item"><div class="box-demo-collage">1</div></div>
                <div class="collage-item collage-item-big"><div class="box-demo-collage">2</div></div>
                <div class="collage-item"><div class="box-demo-collage">3</div></div>
                <div class="collage-item"><div class="box-demo-collage">4</div></div>
                <div class="collage-item collage-item-wide"><div class="box-demo-collage">5</div></div>
                <div class="collage-item"><div class="box-demo-collage">6</div></div>
                <div class="collage-item"><div class="box-demo-collage">7</div></div>
                <div class="collage-item collage-item-tall"><div class="box-demo-collage">8</div></div>
                <div class="collage-item"><div class="box-demo-collage">9</div></div>
                <div class="collage-item"><div class="box-demo-collage">10</div></div>
                <div class="collage-item"><div class="box-demo-collage">11</div></div>
                <div class="collage-item"><div class="box-demo-collage">12</div></div>
                <div class="collage-item"><div class="box-demo-collage">13</div></div>
            </section>

            <br><br>

            <section class="collage collage-no-gap">
                <div class="collage-item"><div class="box-demo-collage">1</div></div>
                <div class="collage-item collage-item-big"><div class="box-demo-collage">2</div></div>
                <div class="collage-item"><div class="box-demo-collage">3</div></div>
                <div class="collage-item"><div class="box-demo-collage">4</div></div>
                <div class="collage-item collage-item-wide"><div class="box-demo-collage">5</div></div>
                <div class="collage-item"><div class="box-demo-collage">6</div></div>
                <div class="collage-item"><div class="box-demo-collage">7</div></div>
                <div class="collage-item collage-item-tall"><div class="box-demo-collage">8</div></div>
                <div class="collage-item"><div class="box-demo-collage">9</div></div>
                <div class="collage-item"><div class="box-demo-collage">10</div></div>
                <div class="collage-item"><div class="box-demo-collage">11</div></div>
                <div class="collage-item"><div class="box-demo-collage">12</div></div>
                <div class="collage-item"><div class="box-demo-collage">13</div></div>
            </section>

            <br><br>

            <section class="collage collage-large-gap">
                <div class="collage-item"><div class="box-demo-collage">1</div></div>
                <div class="collage-item collage-item-big"><div class="box-demo-collage">2</div></div>
                <div class="collage-item"><div class="box-demo-collage">3</div></div>
                <div class="collage-item"><div class="box-demo-collage">4</div></div>
                <div class="collage-item collage-item-wide"><div class="box-demo-collage">5</div></div>
                <div class="collage-item"><div class="box-demo-collage">6</div></div>
                <div class="collage-item"><div class="box-demo-collage">7</div></div>
                <div class="collage-item collage-item-tall"><div class="box-demo-collage">8</div></div>
                <div class="collage-item"><div class="box-demo-collage">9</div></div>
                <div class="collage-item"><div class="box-demo-collage">10</div></div>
                <div class="collage-item"><div class="box-demo-collage">11</div></div>
                <div class="collage-item"><div class="box-demo-collage">12</div></div>
                <div class="collage-item"><div class="box-demo-collage">13</div></div>
            </section>

            <br><br>

            <section class="collage">
                <div class="collage-item"><div class="box-demo-collage">1</div></div>
                <div class="collage-item collage-item-big"><div class="box-demo-collage">2</div></div>
                <div class="collage-item"><div class="box-demo-collage">3</div></div>
                <div class="collage-item"><div class="box-demo-collage">4</div></div>
                <div class="collage-item collage-item-wide"><div class="box-demo-collage">5</div></div>
                <div class="collage-item"><div class="box-demo-collage">6</div></div>
                <div class="collage-item"><div class="box-demo-collage">7</div></div>
                <div class="collage-item collage-item-tall"><div class="box-demo-collage">8</div></div>
                <div class="collage-item"><div class="box-demo-collage">9</div></div>
                <div class="collage-item"><div class="box-demo-collage">10</div></div>
                <div class="collage-item"><div class="box-demo-collage">11</div></div>
                <div class="collage-item"><div class="box-demo-collage">12</div></div>
                <div class="collage-item"><div class="box-demo-collage">13</div></div>
            </section>

        </div> -->

        <!-- ====================================================================== v1.0.3 -->

        <!-- <progress value="30" max="100"></progress>
        <br><br>
        <progress class="progress-primary" value="30" max="100"></progress> -->

        <!-- <div class="column">
            <article class="article article-primary">
                <h3 class="article-header">Article header <span class="article-subheader blocked">This is a subheader</span></h3>

                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod iusto totam consequatur consequuntur modi libero vel nostrum, molestias ab dolorem officia dignissimos at, sed cumque adipisci. Iure quis facere, a!</p>

                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus eos nisi labore soluta velit deleniti, dolor, sequi tenetur ipsa iste cupiditate nemo voluptatum ad repellendus eveniet quod <code>consequuntur</code>, a architecto laborum, provident distinctio autem deserunt illum. Tempora quis quae, laudantium adipisci sapiente ut totam perspiciatis dolorem nemo natus animi error unde <abbr title="mollitia">mollitia</abbr>, ipsum voluptates, qui aspernatur <u>magni</u> debitis non eum aperiam amet neque, quo sint. Deserunt quam porro fugiat, totam ipsa laboriosam id eius explicabo odio, nulla iste nihil suscipit in. Non assumenda expedita placeat libero, neque ex animi, laudantium reprehenderit accusamus rerum est, aperiam minima modi esse vel quisquam.</p>

                <figure class="fig">
                    <img src="http://placehold.it/1400x500" alt="" class="img-full-width">
                    <figcaption class="fig-caption">A caption for the above image.</figcaption>
                </figure>

                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt non consequatur dolorum, molestias unde placeat minima culpa? Perspiciatis id est illum, quaerat a unde in dignissimos cumque, nisi rem similique atque quis doloribus cum ea eos ut temporibus natus necessitatibus! Maiores nobis nemo, provident, iure vel soluta voluptates facilis dolorum consequatur suscipit eos non eius corporis. Voluptates, incidunt officiis possimus rem magnam labore vero earum quos voluptatibus, doloremque numquam tenetur, ex iure commodi illo molestias ullam adipisci! Consequatur minus voluptate facere sit, doloribus laboriosam quia dolores. Porro aperiam sit repudiandae odit cupiditate soluta nisi debitis, excepturi deleniti dolores, odio voluptas nam laudantium magnam, minima provident vero commodi velit esse numquam recusandae quod alias dolore. Eaque nulla repudiandae, similique, libero ullam dolorum ex? Reiciendis magnam voluptate voluptas quia, quas ab eveniet, dolorum debitis unde, repudiandae similique optio nam atque eius architecto, quae? Odit nesciunt, provident voluptate laborum rerum mollitia tenetur ea.</p>

                <aside>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</aside>

                <ul class="list">
                    <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</li>
                    <li>Aliquam tincidunt mauris eu risus.
                        <ul>
                            <li>Quae at provident aperiam mollitia?</li>
                            <li>Ipsum voluptatum quam nulla cumque voluptas nobis et</li>
                            <li>Sit laudantium error optio laborum quae at provident aperiam mollitia?</li>
                        </ul>
                    </li>
                    <li>Vestibulum auctor dapibus neque.</li>
                </ul>

                <blockquote>
                    Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.
                    <cite>H. Rackham</cite>
                </blockquote>

                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nostrum amet quibusdam possimus in, quam delectus veniam commodi ea nemo excepturi est, suscipit impedit ut labore similique dignissimos maiores temporibus voluptatem!</p>

                <p><small class="dimmed">Last updated 23 min ago</small></p>
            </article>

            <br><br><br><br>

            <article class="article">
                <h3 class="article-header">Article header <span class="article-subheader blocked">This is a subheader</span></h3>

                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod iusto totam consequatur consequuntur modi libero vel nostrum, molestias ab dolorem officia dignissimos at, sed cumque adipisci. Iure quis facere, a!</p>

                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus eos nisi labore soluta velit deleniti, dolor, sequi tenetur ipsa iste cupiditate nemo voluptatum ad repellendus eveniet quod <code>consequuntur</code>, a architecto laborum, provident distinctio autem deserunt illum. Tempora quis quae, laudantium adipisci sapiente ut totam perspiciatis dolorem nemo natus animi error unde <abbr title="mollitia">mollitia</abbr>, ipsum voluptates, qui aspernatur <u>magni</u> debitis non eum aperiam amet neque, quo sint. Deserunt quam porro fugiat, totam ipsa laboriosam id eius explicabo odio, nulla iste nihil suscipit in. Non assumenda expedita placeat libero, neque ex animi, laudantium reprehenderit accusamus rerum est, aperiam minima modi esse vel quisquam.</p>

                <figure class="fig">
                    <img src="http://placehold.it/600x200" alt="" class="img">
                    <figcaption class="fig-caption">A caption for the above image.</figcaption>
                </figure>

                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt non consequatur dolorum, molestias unde placeat minima culpa? Perspiciatis id est illum, quaerat a unde in dignissimos cumque, nisi rem similique atque quis doloribus cum ea eos ut temporibus natus necessitatibus! Maiores nobis nemo, provident, iure vel soluta voluptates facilis dolorum consequatur suscipit eos non eius corporis. Voluptates, incidunt officiis possimus rem magnam labore vero earum quos voluptatibus, doloremque numquam tenetur, ex iure commodi illo molestias ullam adipisci! Consequatur minus voluptate facere sit, doloribus laboriosam quia dolores. Porro aperiam sit repudiandae odit cupiditate soluta nisi debitis, excepturi deleniti dolores, odio voluptas nam laudantium magnam, minima provident vero commodi velit esse numquam recusandae quod alias dolore. Eaque nulla repudiandae, similique, libero ullam dolorum ex? Reiciendis magnam voluptate voluptas quia, quas ab eveniet, dolorum debitis unde, repudiandae similique optio nam atque eius architecto, quae? Odit nesciunt, provident voluptate laborum rerum mollitia tenetur ea.</p>

                <pre><code>&lt;figure class=&quot;fig&quot;&gt;
    &lt;img src=&quot;http://placehold.it/600x200&quot; alt=&quot;&quot; class=&quot;img&quot;&gt;
    &lt;figcaption class=&quot;fig-caption&quot;&gt;A caption for the above image.&lt;/figcaption&gt;
&lt;/figure&gt;</code></pre>

                <ul class="list">
                    <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</li>
                    <li>Aliquam tincidunt mauris eu risus.
                        <ul>
                            <li>Quae at provident aperiam mollitia?</li>
                            <li>Ipsum voluptatum quam nulla cumque voluptas nobis et</li>
                            <li>Sit laudantium error optio laborum quae at provident aperiam mollitia?</li>
                        </ul>
                    </li>
                    <li>Vestibulum auctor dapibus neque.</li>
                </ul>

                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nostrum amet quibusdam possimus in, quam delectus veniam commodi ea nemo excepturi est, suscipit impedit ut labore similique dignissimos maiores temporibus voluptatem!</p>

                <dl>
                    <dt>Lorem Ipsum Today</dt>
                    <dd>The passage continues to see frequent usage, with Lorem Ipsum text appearing often in print, graphic and web designs.</dd>
                    <dt>Original Lorem Ipsum Text</dt>
                    <dd>Here are the original Latin passages from which Lorem Ipsum was derived, paired with their 1914 translations by H. Rackham.</dd>
                </dl>

                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui, nesciunt, reiciendis. Ad minus autem, totam aliquam, officiis laborum nihil voluptatem eos quo cum natus nam eum accusamus, asperiores atque tempore mollitia? Perspiciatis laboriosam beatae esse facilis saepe ipsa illum doloremque doloribus natus nihil labore expedita assumenda nemo, alias deleniti eaque, inventore sunt autem animi ex. Debitis quas quasi quisquam illo eos et saepe optio excepturi, autem modi maiores, officia iste, quam cum numquam, nam omnis qui quibusdam aspernatur nihil repellendus? Nulla, magni, labore? Porro ut nemo ipsa, dignissimos, sunt deleniti ipsum nulla eligendi quo explicabo neque cumque excepturi, ad ex!</p>

                <p><small class="dimmed">Last updated 23 min ago</small></p>
            </article>
        </div> -->

        <!-- <div class="box">
            <p class="box-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>

        <div class="box">
            <div class="box-header">Box header</div>
            <div class="box-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
        </div>

        <div class="box">
            <div class="box-header">Box header</div>
            <p class="box-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <div class="box-footer">Box footer</div>
        </div>

        <div class="box box-small">
            <div class="box-header">Box header</div>
            <p class="box-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <div class="box-footer">Box footer</div>
        </div>

        <div class="box box-large">
            <div class="box-header">Box header</div>
            <p class="box-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <div class="box-footer">Box footer</div>
        </div>

        <div class="box box-primary">
            <div class="box-header">Box header</div>
            <p class="box-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <div class="box-footer">Box footer</div>
        </div>

        <div class="box box-secondary">
            <div class="box-header">Box header</div>
            <p class="box-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <div class="box-footer">Box footer</div>
        </div> -->

        <!-- <br><br>
        <button class="button loading">Download button with loading</button>
        <button class="button button-medium loading">Download button with loading</button>
        <button class="button button-small loading">Download button with loading</button>
        <button class="button button-large loading">Download button with loading</button>

        <br><br>
        <button class="button button-primary loading">Download button with loading</button>
        <button class="button button-primary button-medium loading">Download button with loading</button>
        <button class="button button-primary button-small loading">Download button with loading</button>
        <button class="button button-primary button-large loading">Download button with loading</button>

        <br><br>
        <button class="button button-dark loading">Download button with loading</button>
        <button class="button button-dark button-medium loading">Download button with loading</button>
        <button class="button button-dark button-small loading">Download button with loading</button>
        <button class="button button-dark button-large loading">Download button with loading</button> -->

        <!-- <br><br>

        <button class="button button-primary"><i class="ion-android-download"></i> Download button with icon</button>

        <br><br>

        <button class="button button-small"><i class="ion-android-download"></i> Download button with icon</button>

        <br><br>

        <button class="button button-large button-primary"><i class="ion-android-download"></i> Download button with icon</button>

        <br><br>

        <button class="button button-medium"><i class="ion-android-download"></i> Download button with icon</button> -->

        <!--
        <div class="column">

            <div class="tab">
                <ul class="tab-list tab-list-center">
                    <li class="tab-title active" data-tab="#tab11">Tab one</li>
                    <li class="tab-title" data-tab="#tab21">Tab two</li>
                    <li class="tab-title" data-tab="#tab31">Tab three</li>
                </ul>

                <div class="tab-content active" id="tab11">
                    <p>Tab one content with lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit ipsa quibusdam quam quae doloremque optio eius asperiores corrupti consequuntur, sapiente pariatur repellendus aliquid praesentium facilis, vitae nam alias accusantium hic!</p>
                </div>

                <div class="tab-content" id="tab21">
                    <p>Tab two content with lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit ipsa quibusdam quam quae doloremque optio eius asperiores corrupti consequuntur, sapiente pariatur repellendus aliquid praesentium facilis, vitae nam alias accusantium hic! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid expedita eum nam veniam magni vel deleniti cupiditate. Quibusdam architecto, dolorem. Dolore dolores consequatur impedit, tempore dolor ducimus libero commodi possimus.</p>
                </div>

                <div class="tab-content" id="tab31">
                    <p>Tab three content with lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit ipsa quibusdam quam quae doloremque optio eius asperiores corrupti consequuntur, sapiente pariatur repellendus aliquid praesentium facilis, vitae nam alias accusantium hic!</p>
                    <br>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem, aspernatur porro reprehenderit incidunt tempore totam deserunt quia quam, et praesentium amet mollitia facere numquam quaerat hic perspiciatis officia saepe ad.</p>
                </div>
            </div>

            <br><br>

            <div class="tab">
                <ul class="tab-list tab-list-fluid">
                    <li class="tab-title active" data-tab="#tab12">Tab one</li>
                    <li class="tab-title" data-tab="#tab22">Tab two</li>
                    <li class="tab-title" data-tab="#tab32">Tab three</li>
                </ul>

                <div class="tab-content active" id="tab12">
                    <p>Tab one content with lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit ipsa quibusdam quam quae doloremque optio eius asperiores corrupti consequuntur, sapiente pariatur repellendus aliquid praesentium facilis, vitae nam alias accusantium hic!</p>
                </div>

                <div class="tab-content" id="tab22">
                    <p>Tab two content with lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit ipsa quibusdam quam quae doloremque optio eius asperiores corrupti consequuntur, sapiente pariatur repellendus aliquid praesentium facilis, vitae nam alias accusantium hic! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid expedita eum nam veniam magni vel deleniti cupiditate. Quibusdam architecto, dolorem. Dolore dolores consequatur impedit, tempore dolor ducimus libero commodi possimus.</p>
                </div>

                <div class="tab-content" id="tab32">
                    <p>Tab three content with lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit ipsa quibusdam quam quae doloremque optio eius asperiores corrupti consequuntur, sapiente pariatur repellendus aliquid praesentium facilis, vitae nam alias accusantium hic!</p>
                    <br>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem, aspernatur porro reprehenderit incidunt tempore totam deserunt quia quam, et praesentium amet mollitia facere numquam quaerat hic perspiciatis officia saepe ad.</p>
                </div>
            </div>

            <br><br>

            <div class="tab">
                <ul class="tab-list">
                    <li class="tab-title active" data-tab="#tab13">Tab one</li>
                    <li class="tab-title" data-tab="#tab23">Tab two</li>
                    <li class="tab-title" data-tab="#tab33">Tab three</li>
                </ul>

                <div class="tab-content active" id="tab13">
                    <p>Tab one content with lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit ipsa quibusdam quam quae doloremque optio eius asperiores corrupti consequuntur, sapiente pariatur repellendus aliquid praesentium facilis, vitae nam alias accusantium hic!</p>
                </div>

                <div class="tab-content" id="tab23">
                    <p>Tab two content with lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit ipsa quibusdam quam quae doloremque optio eius asperiores corrupti consequuntur, sapiente pariatur repellendus aliquid praesentium facilis, vitae nam alias accusantium hic! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid expedita eum nam veniam magni vel deleniti cupiditate. Quibusdam architecto, dolorem. Dolore dolores consequatur impedit, tempore dolor ducimus libero commodi possimus.</p>
                </div>

                <div class="tab-content" id="tab33">
                    <p>Tab three content with lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit ipsa quibusdam quam quae doloremque optio eius asperiores corrupti consequuntur, sapiente pariatur repellendus aliquid praesentium facilis, vitae nam alias accusantium hic!</p>
                    <br>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem, aspernatur porro reprehenderit incidunt tempore totam deserunt quia quam, et praesentium amet mollitia facere numquam quaerat hic perspiciatis officia saepe ad.</p>
                </div>
            </div>

        </div>
        -->

        <!-- <div class="column">

            <div class="accordion">
                <div class="accordion-item">
                    <div class="accordion-item-title">Accordion title one</div>
                    <div class="accordion-item-body"><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae, consectetur provident officia. Minus perspiciatis iure temporibus facere ratione corporis minima similique iusto aspernatur nemo animi nobis tempora, placeat ducimus totam!</p></div>
                </div>
                <div class="accordion-item active">
                    <div class="accordion-item-title">Accordion title two</div>
                    <div class="accordion-item-body"><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae, consectetur provident officia. Minus perspiciatis iure temporibus facere ratione corporis minima similique iusto aspernatur nemo animi nobis tempora, placeat ducimus totam!</p></div>
                </div>
                <div class="accordion-item">
                    <div class="accordion-item-title">Accordion title three</div>
                    <div class="accordion-item-body"><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae, consectetur provident officia. Minus perspiciatis iure temporibus facere ratione corporis minima similique iusto aspernatur nemo animi nobis tempora, placeat ducimus totam!</p></div>
                </div>
            </div>

        </div> -->

        <!-- <div class="column">
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus et, quae, doloremque rerum deleniti perspiciatis molestias id inventore fuga cum asperiores laudantium quasi. Quaerat nulla, <abbr title="Some title">totam</abbr> quas ducimus. Modi, odit?</p>
            <br>

            <p>Press <kbd>Ctrl+R</kbd> for reload</p>
        </div> -->

        <!-- <div class="column">
            <blockquote>
                Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.
                <cite>H. Rackham</cite>
            </blockquote>
        </div> -->

        <!-- <div class="column">

            <dl>
                <dt>Lorem Ipsum Today</dt>
                <dd>The passage continues to see frequent usage, with Lorem Ipsum text appearing often in print, graphic and web designs.</dd>
                <dt>Original Lorem Ipsum Text</dt>
                <dd>Here are the original Latin passages from which Lorem Ipsum was derived, paired with their 1914 translations by H. Rackham.</dd>
            </dl>

            <hr>

            <dl class="indented-list">
                <dt>Lorem Ipsum Today</dt>
                <dd>The passage continues to see frequent usage, with Lorem Ipsum text appearing often in print, graphic and web designs.</dd>
                <dt>Original Lorem Ipsum Text</dt>
                <dd>Here are the original Latin passages from which Lorem Ipsum was derived, paired with their 1914 translations by H. Rackham.</dd>
            </dl>

        </div> -->

        <!-- <div class="column">
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Veniam ratione, consectetur, facilis omnis porro repellendus maiores obcaecati sed illum quasi eveniet illo iusto, fuga? Debitis facilis qui minima accusantium obcaecati.</p>

            <hr>

            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi, nostrum eaque quibusdam blanditiis, beatae aliquam ab ad maxime praesentium. Earum id ullam harum quibusdam maxime iste, iusto laudantium provident nemo velit quae molestiae consectetur. Similique est porro dolor deleniti perspiciatis adipisci repellendus, aut earum explicabo dignissimos temporibus culpa optio, dolorem rem suscipit sint sunt distinctio commodi vitae reprehenderit, magnam, deserunt. Voluptatem repudiandae non quas, quos commodi sapiente ipsum ut harum odit dicta nostrum aliquid provident sed. Quo voluptatibus dolore provident beatae neque reprehenderit minus, veniam at nisi aliquam! Pariatur esse deleniti cupiditate, obcaecati mollitia aliquid laborum voluptatum ipsam explicabo laudantium.</p>
        </div> -->


        <br><br>

        <!-- <div class="row">
            <div class="columns large-3">
                <div class="stat">
                    <span class="stat-header">Tweets</span>
                    <span class="stat-body">55654</span>
                    <span class="stat-footer">Last updated 23 min ago</span>
                </div>
            </div>
            <div class="columns large-3">
                <div class="stat">
                    <span class="stat-header">Following</span>
                    <span class="stat-body">546</span>
                    <span class="stat-footer">Last updated 23 min ago</span>
                </div>
            </div>
            <div class="columns large-3">
                <div class="stat">
                    <span class="stat-header">Follwer</span>
                    <span class="stat-body">321</span>
                    <span class="stat-footer">Last updated 23 min ago</span>
                </div>
            </div>
            <div class="columns large-3">
                <div class="stat">
                    <span class="stat-header">Likes</span>
                    <span class="stat-body">1k</span>
                    <span class="stat-footer">Last updated 23 min ago</span>
                </div>
            </div>
        </div> -->


        <!-- <p class="show-small-only">small only text</p>
        <p class="show-medium-up">show medium up</p> -->

        <!-- <div style="height: 2000px">
            <button class="button js-open-modal" data-modal="#modal">Open modal</button>
        </div>

        <div class="modal" id="modal">
            <div class="modal-content large">
                <div class="modal-header">Modal header <button class="modal-close">✖</button></div>
                <div class="modal-body">
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit delectus quae autem ducimus neque. Pariatur numquam iure aspernatur aliquid sit. Eos eveniet delectus dicta consectetur quaerat molestiae maiores, neque culpa.</p>
                </div>
                <div class="modal-footer">
                    <button class="button js-modal-close">Okay</button>
                    <button class="button button-primary float-right js-modal-close">Close</button>
                </div>
            </div>
        </div> -->

        <!-- <div class="column">
            <div class="dropdown">
                <button class="button has-dropdown-icon">Dropdown</button>
                <div class="dropdown-body">
                    <div class="dropdown-body-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt eveniet dolore maxime ducimus commodi impedit est nulla deleniti voluptatibus similique labore, repellat alias totam mollitia veniam nostrum repellendus debitis quisquam.</div>
                </div>
            </div>

            <br><br>

            <div class="dropdown">
                <button class="button button-primary has-dropdown-icon">Dropdown</button>
                <div class="dropdown-body">
                    <a class="dropdown-item" href="#">Action</a>
                    <a class="dropdown-item" href="#">Another action</a>
                    <span class="dropdown-item-sep"></span>
                    <a class="dropdown-item" href="#">Something else here</a>
                </div>
            </div>
        </div>

        <br><br><br><br><br><br><br><br> -->

        <!-- <div class="row">
            <div class="columns large-4">

                <div class="card">
                    <img class="card-img" src="https://picsum.photos/300/150?random" />
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <h6 class="card-subtitle">Commodi veniam non perferendis</h6>
                        <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi veniam non perferendis dolorem quasi!</p>
                        <a href="#" class="button button-primary">Button</a>
                        <p class="card-information">27th Jan, 2018</p>
                    </div>
                </div>

            </div>
            <div class="columns large-4">

                <div class="card card-primary">
                    <img class="card-img" src="https://picsum.photos/300/150?random" />
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <h6 class="card-subtitle">Commodi veniam non perferendis</h6>
                        <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi veniam non perferendis dolorem quasi!</p>
                        <a href="#" class="button button-dark">Button</a>
                        <p class="card-information">27th Jan, 2018</p>
                    </div>
                </div>

            </div>
            <div class="columns large-4">

                <div class="card card-dark">
                    <img class="card-img" src="https://picsum.photos/300/150?random" />
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <h6 class="card-subtitle">Commodi veniam non perferendis</h6>
                        <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi veniam non perferendis dolorem quasi!</p>
                        <a href="#" class="button button-primary">Button</a>
                        <p class="card-information">27th Jan, 2018</p>
                    </div>
                </div>

            </div>
        </div>

        <br><br>

        <div class="row">
            <div class="columns large-4">

                <div class="card">
                    <div class="card-header">
                        Card header
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <h6 class="card-subtitle">Commodi veniam non perferendis</h6>
                        <img class="card-body-img rounded" src="https://picsum.photos/300/150?random" alt="">
                        <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi veniam non perferendis dolorem quasi!</p>
                        <a href="#" class="button button-primary">Button</a>
                        <p class="card-information">27th Jan, 2018</p>
                    </div>
                    <div class="card-footer">
                        Card footer
                    </div>
                </div>

            </div>
            <div class="columns large-4">

                <div class="card card-primary">
                    <div class="card-header">
                        Card header
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <h6 class="card-subtitle">Commodi veniam non perferendis</h6>
                        <img class="card-body-img rounded" src="https://picsum.photos/300/150?random" alt="">
                        <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi veniam non perferendis dolorem quasi!</p>
                        <a href="#" class="button button-dark">Button</a>
                        <p class="card-information">27th Jan, 2018</p>
                    </div>
                    <div class="card-footer">
                        Card footer
                    </div>
                </div>

            </div>
            <div class="columns large-4">

                <div class="card card-tertiary">
                    <div class="card-header">
                        Card header
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <h6 class="card-subtitle">Commodi veniam non perferendis</h6>
                        <img class="card-body-img rounded" src="https://picsum.photos/300/150?random" alt="">
                        <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi veniam non perferendis dolorem quasi!</p>
                        <a href="#" class="button button-dark">Button</a>
                        <p class="card-information">27th Jan, 2018</p>
                    </div>
                    <div class="card-footer">
                        Card footer
                    </div>
                </div>

            </div>
        </div> -->

        <!-- <div class="column">

            <div class="button-group">
                <a class="button button-primary" href="#">First</a>
                <a class="button button-primary active" href="#">Second</a>
                <a class="button button-primary" href="#">Third</a>
            </div>

            <br><br>

            <div class="button-group">
                <a class="button" href="#">First</a>
                <a class="button active" href="#">Second</a>
                <a class="button" href="#">Third</a>
            </div>

            <br><br>

            <div class="button-group">
                <a class="button" href="#">1</a>
                <a class="button active" href="#">2</a>
                <a class="button" href="#">3</a>
            </div>

            <br><br>

        </div> -->

        <!-- <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="#">Dashboard</a></li>
            <li class="breadcrumb-item"><a href="#">Report</a></li>
            <li class="breadcrumb-item active">Data</li>
        </ol> -->

        <!-- <div class="column">
            <span class="badge">Default</span>
            <span class="badge badge-primary">Primary</span>
            <span class="badge badge-secondary">Secondary</span>
            <span class="badge badge-tertiary">Tertiary</span>
            <span class="badge badge-info">Info</span>
            <span class="badge badge-success">Success</span>
            <span class="badge badge-danger">Danger</span>
            <span class="badge badge-link">Link</span>
            <span class="badge badge-dark">Dark</span>
            <span class="badge badge-black">Black</span>
        </div> -->

        <!-- <div class="column">
            <div class="message">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum nostrum itaque ex in nihil ea ipsa dolorum quam expedita molestias, nesciunt, qui maxime doloribus facilis, culpa laborum animi obcaecati distinctio. <button class="message-close">✖</button>
            </div>
            <div class="message message-primary">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum nostrum itaque ex in nihil ea ipsa dolorum quam expedita molestias, nesciunt, qui maxime doloribus facilis, culpa laborum animi obcaecati distinctio. <button class="message-close">✖</button>
            </div>
            <div class="message message-secondary">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum nostrum itaque ex in nihil ea ipsa dolorum quam expedita molestias, nesciunt, qui maxime doloribus facilis, culpa laborum animi obcaecati distinctio. <button class="message-close">✖</button>
            </div>
            <div class="message message-tertiary">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum nostrum itaque ex in nihil ea ipsa dolorum quam expedita molestias, nesciunt, qui maxime doloribus facilis, culpa laborum animi obcaecati distinctio.
            </div>
            <div class="message message-info">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum nostrum itaque ex in nihil ea ipsa dolorum quam expedita molestias, nesciunt, qui maxime doloribus facilis, culpa laborum animi obcaecati distinctio.
            </div>
            <div class="message message-success">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum nostrum itaque ex in nihil ea ipsa dolorum quam expedita molestias, nesciunt, qui maxime doloribus facilis, culpa laborum animi obcaecati distinctio.
            </div>
            <div class="message message-danger">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum nostrum itaque ex in nihil ea ipsa dolorum quam expedita molestias, nesciunt, qui maxime doloribus facilis, culpa laborum animi obcaecati distinctio.
            </div>
            <div class="message message-link">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum nostrum itaque ex in nihil ea ipsa dolorum quam expedita molestias, nesciunt, qui maxime doloribus facilis, culpa laborum animi obcaecati distinctio.
            </div>
            <div class="message message-dark">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum nostrum itaque ex in nihil ea ipsa dolorum quam expedita molestias, nesciunt, qui maxime doloribus facilis, culpa laborum animi obcaecati distinctio.
            </div>
            <div class="message message-black">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum nostrum itaque ex in nihil ea ipsa dolorum quam expedita molestias, nesciunt, qui maxime doloribus facilis, culpa laborum animi obcaecati distinctio.
            </div>
        </div> -->

        <!-- <div class="row">
            <div class="columns large-6">
                <img src="http://placehold.it/1000x500" alt="" class="img">
            </div>
            <div class="columns large-6">
                <img src="http://placehold.it/1000x500" alt="" class="img">
            </div>
            <div class="columns large-6">
                <img src="http://placehold.it/1000x500" alt="" class="img rounded">
            </div>
            <div class="columns large-6">
                <img src="http://placehold.it/1000x500" alt="" class="img-full-width">
            </div>
            <div class="columns large-6">
                <figure class="fig-center">
                    <img src="http://placehold.it/200x150" alt="" class="img">
                    <figcaption class="fig-caption">A caption for the above image.</figcaption>
                </figure>
            </div>
            <div class="columns large-6">
                <figure class="fig">
                    <img src="http://placehold.it/1000x500" alt="" class="img">
                    <figcaption class="fig-caption">A caption for the above image.</figcaption>
                </figure>
            </div>
        </div> -->

        <!-- <div class="column">
            <div class="table-responsive">
                <table class="table table-bordered full-width">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Sex</th>
                            <th>Location</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Sex</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Dave Gamache</td>
                            <td>26</td>
                            <td>Male</td>
                            <td>San Francisco</td>
                            <td>Dave Gamache</td>
                            <td>26</td>
                            <td>Male</td>
                            <td>San Francisco</td>
                        </tr>
                        <tr>
                            <td>Dwayne Johnson</td>
                            <td>42</td>
                            <td>Male</td>
                            <td>Hayward</td>
                            <td>Dave Gamache</td>
                            <td>26</td>
                            <td>Male</td>
                            <td>San Francisco</td>
                        </tr>
                        <tr>
                            <td>Dave Gamache</td>
                            <td>26</td>
                            <td>Male</td>
                            <td>San Francisco</td>
                            <td>Dave Gamache</td>
                            <td>26</td>
                            <td>Male</td>
                            <td>San Francisco</td>
                        </tr>
                        <tr>
                            <td>Dwayne Johnson</td>
                            <td>42</td>
                            <td>Male</td>
                            <td>Hayward</td>
                            <td>Dave Gamache</td>
                            <td>26</td>
                            <td>Male</td>
                            <td>San Francisco</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div> -->

        <!-- <div class="column">
            <pre><code>.some-class {
    background-color: red;
}</code></pre>
        </div> -->

        <!-- <div class="column">
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe autem repellat architecto fuga, mollitia est ab eos expedita excepturi distinctio impedit velit quisquam necessitatibus? Porro sunt odio, voluptates tempore rerum.</p>

            <ul class="list">
                <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo repellendus harum unde, asperiores architecto doloribus. Dignissimos deserunt eaque facere eos necessitatibus aut perferendis pariatur, quibusdam alias similique, aliquid sed saepe!</li>
                <li>Aliquam tincidunt mauris eu risus.
                    <ul>
                        <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum voluptatum quam nulla cumque voluptas nobis et, possimus quod sapiente corporis, sit laudantium error optio laborum quae at provident aperiam mollitia?</li>
                        <li>Ipsum voluptatum quam nulla cumque voluptas nobis et, possimus quod sapiente corporis, sit laudantium error optio laborum quae at provident aperiam mollitia?</li>
                        <li>Sit laudantium error optio laborum quae at provident aperiam mollitia?</li>
                    </ul>
                </li>
                <li>Vestibulum auctor dapibus neque.</li>
            </ul>

            <ol class="list-numbered">
                <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo repellendus harum unde, asperiores architecto doloribus. Dignissimos deserunt eaque facere eos necessitatibus aut perferendis pariatur, quibusdam alias similique, aliquid sed saepe!</li>
                <li>Aliquam tincidunt mauris eu risus.
                    <ol>
                        <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum voluptatum quam nulla cumque voluptas nobis et, possimus quod sapiente corporis, sit laudantium error optio laborum quae at provident aperiam mollitia?</li>
                        <li>Ipsum voluptatum quam nulla cumque voluptas nobis et, possimus quod sapiente corporis, sit laudantium error optio laborum quae at provident aperiam mollitia?</li>
                        <li>Sit laudantium error optio laborum quae at provident aperiam mollitia?</li>
                    </ol>
                </li>
                <li>Vestibulum auctor dapibus neque.</li>
            </ol>
        </div> -->

        <br><br>
        <form class="form" action="./" method="post">
            <div class="row">
                <div class="columns large-2">
                    <label for="name1" class="form-label right">Name</label>
                </div>
                <div class="columns large-4">
                    <div class="form-field">
                        <input type="text" name="name1" id="name1" class="form-input" placeholder="e.g James smith">
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>
                </div>
                <div class="columns large-2 newrow">
                    <label for="email1" class="form-label right">Email address</label>
                </div>
                <div class="columns large-4">
                    <div class="form-field">
                        <input type="email" name="email1" id="email1" class="form-input" placeholder="e.g james@example.com">
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>
                </div>
                <div class="columns large-4 large-offset-2 newrow">
                    <button type="submit" class="button button-primary">Send message</button>
                </div>
            </div>

            <br><br><br><br><br><br>
            <div class="row">
                <div class="columns large-6">
                    <div class="form-field error">
                        <label for="name" class="form-label">Name</label>
                        <input type="text" name="name" id="name" class="form-input" placeholder="e.g James smith">
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field success">
                        <label for="email" class="form-label">Email address</label>
                        <input type="email" name="email" id="email" class="form-input" placeholder="e.g james@example.com">
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field large">
                        <label for="country" class="form-label">Select country</label>
                        <select name="country" id="country" class="form-select">
                            <option value="US">United state</option>
                            <option value="UK">United Kingdom</option>
                        </select>
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field">
                        <label for="country_multiple" class="form-label">Select multiple</label>
                        <select name="country_multiple" id="country_multiple" class="form-select" multiple>
                            <option value="US">United state</option>
                            <option value="UK">United Kingdom</option>
                            <option value="CA">Canada</option>
                            <option value="BD">Bangladesh</option>
                            <option value="">None</option>
                        </select>
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field">
                        <label for="photo" class="form-label">Upload photo</label>
                        <input type="file" name="photo" id="photo" class="form-file">
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field small">
                        <label for="small_field" class="form-label">Small field</label>
                        <input type="text" name="small_field" id="small_field" class="form-input" placeholder="e.g Small field">
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field large">
                        <label for="large_field" class="form-label">Large field</label>
                        <input type="text" name="large_field" id="large_field" class="form-input" placeholder="e.g Large field">
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field">
                        <label class="form-label">Select gender</label>
                        <div class="form-radio-items">
                            <label class="form-radio-item"><input type="radio" name="gender" id="male" class="form-radio"> Male</label>
                            <label class="form-radio-item"><input type="radio" name="gender" id="female" class="form-radio"> Male</label>
                            <label class="form-radio-item"><input type="radio" name="gender" id="nogender" class="form-radio" disabled> <span class="dimmed">No gender</span></label>
                        </div>
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field vertical">
                        <label class="form-label">Select gender</label>
                        <div class="form-radio-items">
                            <label class="form-radio-item"><input type="radio" name="gender" id="male" class="form-radio"> Male</label>
                            <label class="form-radio-item"><input type="radio" name="gender" id="female" class="form-radio"> Male</label>
                            <label class="form-radio-item"><input type="radio" name="gender" id="nogender" class="form-radio"> No gender</label>
                        </div>
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field">
                        <label class="form-checkbox-label"><input type="checkbox" class="form-check-input"> I agree with the <a href="">terms and conditions</a> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Praesentium commodi ea aliquam nisi illo eligendi facere, iure voluptates recusandae, dolorum harum. Explicabo cum, libero molestias eaque debitis asperiores, sint ratione.</label>
                    </div>

                    <div class="form-field small">
                        <label class="form-checkbox-label"><input type="checkbox" class="form-check-input"> I agree with the <a href="">terms and conditions</a> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Praesentium commodi ea aliquam nisi illo eligendi facere, iure voluptates recusandae, dolorum harum. Explicabo cum, libero molestias eaque debitis asperiores, sint ratione.</label>
                    </div>

                </div>
                <div class="columns large-6">

                    <div class="form-field warning">
                        <label for="message" class="form-label">Message</label>
                        <textarea name="message" id="message" class="form-textarea" placeholder="e.g Write something here!"></textarea>
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                </div>

                <div class="columns large-12">
                    <button type="submit" class="button button-primary">Send message</button>
                </div>
            </div>
        </form>

        <br><br>

        <!-- <br><br>

        <div class="grid-column">
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorem qui molestias consequatur inventore. Perspiciatis odio vitae necessitatibus cum sunt, illo voluptas, placeat odit similique repellendus ipsam cumque autem dolorum quia?</p>
        </div>

        <br><br>

        <div class="grid">
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
            <div class="cell"><div class="box-demo">1</div></div>
        </div>

        <br><br>

        <div class="grid">
            <div class="cell sm-4 md-6 lg-3"><div class="box-demo">box-demo</div></div>
            <div class="cell sm-4 md-6 lg-3"><div class="box-demo">box-demo</div></div>
            <div class="cell sm-4 md-6 lg-3"><div class="box-demo">box-demo</div></div>
            <div class="cell sm-12 md-6 lg-3"><div class="box-demo">box-demo</div></div>
        </div>

        <br><br>

        <div class="grid">
            <div class="cell lg-6"><div class="box-demo">box-demo</div></div>
            <div class="cell lg-6">
                <div class="box-demo">box-demo</div>

                <div class="grid">
                    <div class="cell lg-6"><div class="box-demo">box-demo</div></div>
                    <div class="cell lg-12"><div class="box-demo">box-demo</div></div>
                </div>
            </div>
        </div> -->

        <!-- <div class="row">
            <div class="columns large-4">
                <ul class="nav">
                    <li><a href="#">Documentation</a></li>
                    <li><a href="#">About</a></li>
                </ul>
            </div>
            <div class="columns large-4">
                <a href="./"><h3>roolith</h3></a>
            </div>
            <div class="columns large-4">
                <ul class="nav">
                    <li><a href="#">Github</a></li>
                </ul>
            </div>
        </div>

        <div class="column">
            <div class="row">
                <div class="columns large-6">a</div>
                <div class="columns large-6">b</div>
            </div>
        </div> -->

        <!-- <div class="column">
            <br><br>

            <ul class="nav">
                <li class="nav-item"><a href="#" class="nav-link">Documentation</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Modules</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Helper</a></li>
                <li class="nav-item"><a href="#" class="nav-link">About</a></li>
            </ul>

            <br><br>

            <ul class="nav nav-right">
                <li class="nav-item"><a href="#" class="nav-link">Documentation</a></li>
                <li class="nav-item active"><a href="#" class="nav-link">Active menu</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Helper</a></li>
                <li class="nav-item"><a href="#" class="nav-link dimmed">About</a></li>
            </ul>

            <br><br>

            <ul class="nav nav-center">
                <li class="nav-item"><a href="#" class="nav-link">Documentation</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Modules</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Helper</a></li>
                <li class="nav-item"><a href="#" class="nav-link">About</a></li>
            </ul>

            <br><br>

            <ul class="nav nav-primary">
                <li class="nav-item"><a href="#" class="nav-link">Documentation</a></li>
                <li class="nav-item active"><a href="#" class="nav-link">Modules</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Helper</a></li>
                <li class="nav-item"><a href="#" class="nav-link dimmed">About</a></li>
            </ul>

            <br><br>
            <br><br>

            <ul class="nav nav-primary nav-center">
                <li class="nav-item"><a href="#" class="nav-link">Documentation</a></li>
                <li class="nav-item active"><a href="#" class="nav-link">Modules</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Helper</a></li>
                <li class="nav-item"><a href="#" class="nav-link dimmed">About</a></li>
                <li class="nav-item"><a href="#" class="nav-link nav-link-danger">Sign in</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Menu item</a></li>
                <li class="nav-item"><a href="#" class="nav-link nav-link-tertiary">Create new account</a></li>
            </ul>

            <br><br><br><br>

            <ul class="nav nav-primary nav-vertical" style="max-width: 250px">
                <li class="nav-item"><a href="#" class="nav-link">Documentation</a></li>
                <li class="nav-item active"><a href="#" class="nav-link">Modules</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Helper</a></li>
                <li class="nav-item"><a href="#" class="nav-link dimmed">About</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Sign in</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Menu item</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Create new account</a></li>
            </ul>

            <br><br><br><br>

        </div> -->

        <div class="column">
            <!-- <br><br>

            <button class="button disabled">Default button</button>
            <button class="button button-outline">Outlined button</button>
            <button class="button button-rounded">Rounded button</button>

            <hr>

            <button class="button button-small">Default button</button>
            <button class="button button-outline button-small">Outlined button</button>
            <button class="button button-rounded button-small">Rounded button</button>

            <hr>

            <button class="button button-medium">Default button</button>
            <button class="button button-outline button-medium">Outlined button</button>
            <button class="button button-rounded button-medium">Rounded button</button>

            <hr>

            <button class="button button-large">Default button</button>
            <button class="button button-outline button-large">Outlined button</button>
            <button class="button button-rounded button-large">Rounded button</button>

            <hr>

            <button class="button button-primary button-primary">Default button</button>
            <button class="button button-primary button-outline">Outlined button</button>
            <button class="button button-primary button-rounded">Rounded button</button>

            <hr>

            <button class="button button-primary button-small">Default button</button>
            <button class="button button-primary button-outline button-small">Outlined button</button>
            <button class="button button-primary button-rounded button-small">Rounded button</button>

            <hr>

            <button class="button button-primary button-medium disabled">Default button</button>
            <button class="button button-primary button-outline button-medium">Outlined button</button>
            <button class="button button-primary button-rounded button-medium">Rounded button</button>

            <hr>

            <button class="button button-primary button-large">Default button</button>
            <button class="button button-primary button-outline button-large">Outlined button</button>
            <button class="button button-primary button-rounded button-large">Rounded button</button>

            <br><br> -->

            <!-- <br><br>

            <a class="button button-small" href="#">Small</a>
            <a class="button button-primary button-small" href="#">Primary</a>
            <a class="button button-secondary button-small" href="#">Secondary</a>
            <a class="button button-tertiary button-small" href="#">Tertiary</a>
            <a class="button button-info button-small" href="#">Info</a>
            <a class="button button-success button-small" href="#">Success</a>
            <a class="button button-danger button-small" href="#">Danger</a>
            <a class="button button-link button-small" href="#">Link</a>

            <br><br>

            <a class="button button-medium" href="#">Medium</a>
            <a class="button button-primary button-medium" href="#">Primary</a>
            <a class="button button-secondary button-medium" href="#">Secondary</a>
            <a class="button button-tertiary button-medium" href="#">Tertiary</a>
            <a class="button button-info button-medium" href="#">Info</a>
            <a class="button button-success button-medium" href="#">Success</a>
            <a class="button button-danger button-medium" href="#">Danger</a>
            <a class="button button-link button-medium" href="#">Link</a>

            <br><br>

            <a class="button" href="#">Normal</a>
            <a class="button button-primary" href="#">Primary</a>
            <a class="button button-secondary" href="#">Secondary</a>
            <a class="button button-tertiary" href="#">Tertiary</a>
            <a class="button button-info" href="#">Info</a>
            <a class="button button-success" href="#">Success</a>
            <a class="button button-danger" href="#">Danger</a>
            <a class="button button-link" href="#">Link</a>

            <br><br>

            <a class="button button-large" href="#">Large</a>
            <a class="button button-primary button-large" href="#">Primary</a>
            <a class="button button-secondary button-large" href="#">Secondary</a>
            <a class="button button-tertiary button-large" href="#">Tertiary</a>
            <a class="button button-info button-large" href="#">Info</a>
            <a class="button button-success button-large" href="#">Success</a>
            <a class="button button-danger button-large" href="#">Danger</a>
            <a class="button button-link button-large" href="#">Link</a> -->
        </div>

        <!-- <div class="column">
            <h1>Heading</h1>
            <h2>Heading</h2>
            <h3>Heading</h3>
            <h4>Heading</h4>
            <h5>Heading</h5>
            <h6>Heading</h6>

            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat maxime velit voluptatibus doloribus ad accusantium necessitatibus eos explicabo inventore eligendi quam beatae, expedita. Impedit quae, amet autem nihil perspiciatis. Impedit.</p>

            <p>
                <strong>Bolded</strong>
                <em>Italicized</em>
                <a>Colored</a>
                <u>Underlined</u>
                <code>code</code>
            </p>
        </div> -->

        <!-- <div class="column">
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorem qui molestias consequatur inventore. Perspiciatis odio vitae necessitatibus cum sunt, illo voluptas, placeat odit similique repellendus ipsam cumque autem dolorum quia?</p>
        </div> -->


        <!-- <div class="row">
            <div class="columns small-6 large-6 large-push-6"><div class="box-demo">small left, large right</div></div>
            <div class="columns small-6 large-6 large-pull-6"><div class="box-demo">small right, large left</div></div>
        </div> -->


        <!-- <div class="grid">
            <div class="sm-4 md-6 lg-3"><div class="box-demo">box-demo</div></div>
            <div class="sm-4 md-6 lg-3"><div class="box-demo">box-demo</div></div>
            <div class="sm-4 md-6 lg-3"><div class="box-demo">box-demo</div></div>
            <div class="sm-12 md-6 lg-3"><div class="box-demo">box-demo</div></div>
        </div>

        <div class="grid">
            <div class="sm-4 md-8 lg-6"><div class="box-demo">box-demo</div></div>
            <div class="sm-8 md-4 lg-6"><div class="box-demo">box-demo</div></div>
        </div>

        <div class="grid">
            <div class="sm-6 md-6 md-push-6"><div class="box-demo">sm left, lg right</div></div>
            <div class="sm-6 md-6 md-pull-6"><div class="box-demo">sm right, lg left</div></div>
        </div> -->


        <!-- <div class="row">
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
        </div>

        <div class="row">
            <div class="columns large-2"><div class="box-demo">2</div></div>
            <div class="columns large-2"><div class="box-demo">2</div></div>
            <div class="columns large-2"><div class="box-demo">2</div></div>
            <div class="columns large-2"><div class="box-demo">2</div></div>
            <div class="columns large-2"><div class="box-demo">2</div></div>
            <div class="columns large-2"><div class="box-demo">2</div></div>
        </div>

        <div class="row">
            <div class="columns large-3"><div class="box-demo">3</div></div>
            <div class="columns large-3"><div class="box-demo">3</div></div>
            <div class="columns large-3"><div class="box-demo">3</div></div>
            <div class="columns large-3"><div class="box-demo">3</div></div>
        </div>

        <div class="row">
            <div class="columns large-4"><div class="box-demo">4</div></div>
            <div class="columns large-4"><div class="box-demo">4</div></div>
            <div class="columns large-4"><div class="box-demo">4</div></div>
        </div>

        <div class="row">
            <div class="columns large-1"><div class="box-demo">1</div></div>
            <div class="columns large-5"><div class="box-demo">5</div></div>
            <div class="columns large-5"><div class="box-demo">5</div></div>
            <div class="columns large-1"><div class="box-demo">1</div></div>
        </div>

        <div class="row">
            <div class="columns large-6"><div class="box-demo">6</div></div>
            <div class="columns large-6"><div class="box-demo">6</div></div>
        </div>

        <div class="row">
            <div class="columns large-12"><div class="box-demo">12</div></div>
        </div>

        <div class="row">
            <div class="columns large-4 medium-6 small-12"><div class="box-demo">large-4 medium-6 small-12</div></div>
            <div class="columns large-4 medium-6 small-12"><div class="box-demo">large-4 medium-6 small-12</div></div>
            <div class="columns large-4 medium-6 small-12"><div class="box-demo">large-4 medium-6 small-12</div></div>
            <div class="columns large-4 medium-6 small-12"><div class="box-demo">large-4 medium-6 small-12</div></div>
            <div class="columns large-4 medium-6 small-12"><div class="box-demo">large-4 medium-6 small-12</div></div>
            <div class="columns large-4 medium-6 small-12"><div class="box-demo">large-4 medium-6 small-12</div></div>
        </div>

        <div class="row">
            <div class="columns large-4 medium-6 small-6">
                <div class="box-demo">large-4 medium-6 small-6</div>

                <div class="row">
                    <div class="columns large-6"><div class="box-demo">large-6</div></div>
                    <div class="columns large-6">
                        <div class="row">
                            <div class="columns large-6"><div class="box-demo">large-6</div></div>
                            <div class="columns large-6"><div class="box-demo">large-6</div></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="columns large-4 medium-3 small-6">
                <div class="box-demo">large-4 medium-3 small-6</div>
            </div>
            <div class="columns large-4 medium-3 small-12">
                <div class="box-demo">large-4 medium-3 small-12</div>
            </div>
        </div> -->

    </div>

    <script src="jquery-3.3.1.min.js"></script>
    <script src="test.js"></script>
</body>
</html>
