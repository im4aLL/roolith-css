<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>roolith CSS framework</title>

    <link rel="stylesheet" href="dist/css/roolith.css?v=<?= time() ?>">
    <style>
        .box { width: 100%; background-color: #ddd; padding: 10px; margin-bottom: 20px; text-align: center; border-radius: 2px; font-size: 80%; }
    </style>
</head>
<body>
    <div class="container">



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

            <div class="dropdown active">
                <button class="button button-primary has-dropdown-icon">Dropdown</button>
                <div class="dropdown-body">
                    <a class="dropdown-item" href="#">Action</a>
                    <a class="dropdown-item" href="#">Another action</a>
                    <span class="dropdown-item-sep"></span>
                    <a class="dropdown-item" href="#">Something else here</a>
                </div>
            </div>
        </div> -->

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
            <table class="table table-bordered">
                <thead>
                    <tr>
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
                    </tr>
                    <tr>
                        <td>Dwayne Johnson</td>
                        <td>42</td>
                        <td>Male</td>
                        <td>Hayward</td>
                    </tr>
                    <tr>
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
                    </tr>
                </tbody>
            </table>
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

        <!-- <br><br>
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
                    <div class="form-field">
                        <label for="name" class="form-label">Name</label>
                        <input type="text" name="name" id="name" class="form-input" placeholder="e.g James smith" readonly>
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field">
                        <label for="email" class="form-label">Email address</label>
                        <input type="email" name="email" id="email" class="form-input" placeholder="e.g james@example.com">
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field">
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
                        <label class="form-checkbox-label small"><input type="checkbox" class="form-check-input"> I agree with the <a href="">terms and conditions</a> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Praesentium commodi ea aliquam nisi illo eligendi facere, iure voluptates recusandae, dolorum harum. Explicabo cum, libero molestias eaque debitis asperiores, sint ratione.</label>
                    </div>

                </div>
                <div class="columns large-6">

                    <div class="form-field">
                        <label for="message" class="form-label">Message</label>
                        <textarea name="message" id="message" class="form-textarea" placeholder="e.g Write something here!"></textarea>
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                </div>

                <div class="columns large-12">
                    <button type="submit" class="button button-primary">Send message</button>
                </div>
            </div>
        </form> -->

        <!-- <br><br>

        <div class="grid-column">
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorem qui molestias consequatur inventore. Perspiciatis odio vitae necessitatibus cum sunt, illo voluptas, placeat odit similique repellendus ipsam cumque autem dolorum quia?</p>
        </div>

        <br><br>

        <div class="grid">
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
            <div class="cell"><div class="box">1</div></div>
        </div>

        <br><br>

        <div class="grid">
            <div class="cell sm-4 md-6 lg-3"><div class="box">box</div></div>
            <div class="cell sm-4 md-6 lg-3"><div class="box">box</div></div>
            <div class="cell sm-4 md-6 lg-3"><div class="box">box</div></div>
            <div class="cell sm-12 md-6 lg-3"><div class="box">box</div></div>
        </div>

        <br><br>

        <div class="grid">
            <div class="cell lg-6"><div class="box">box</div></div>
            <div class="cell lg-6">
                <div class="box">box</div>

                <div class="grid">
                    <div class="cell lg-6"><div class="box">box</div></div>
                    <div class="cell lg-12"><div class="box">box</div></div>
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

        <!-- <div class="column">
            <a class="button" href="#">Anchor button</a>
            <button>Button element</button>
            <input type="submit" value="Submit input">
            <input type="button" value="Button input">

            <br><br>

            <a class="button button-primary" href="#">Anchor button</a>
            <button class="button button-primary">Button element</button>
            <input class="button button-primary" type="submit" value="Submit input">
            <input class="button button-primary" type="button" value="Button input">

            <br><br>

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
            <a class="button button-link button-large" href="#">Link</a>
        </div> -->

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
        <!--

        <div class="row">
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
        </div>

        <div class="row">
            <div class="columns large-2"><div class="box">2</div></div>
            <div class="columns large-2"><div class="box">2</div></div>
            <div class="columns large-2"><div class="box">2</div></div>
            <div class="columns large-2"><div class="box">2</div></div>
            <div class="columns large-2"><div class="box">2</div></div>
            <div class="columns large-2"><div class="box">2</div></div>
        </div>

        <div class="row">
            <div class="columns large-3"><div class="box">3</div></div>
            <div class="columns large-3"><div class="box">3</div></div>
            <div class="columns large-3"><div class="box">3</div></div>
            <div class="columns large-3"><div class="box">3</div></div>
        </div>

        <div class="row">
            <div class="columns large-4"><div class="box">4</div></div>
            <div class="columns large-4"><div class="box">4</div></div>
            <div class="columns large-4"><div class="box">4</div></div>
        </div>

        <div class="row">
            <div class="columns large-1"><div class="box">1</div></div>
            <div class="columns large-5"><div class="box">5</div></div>
            <div class="columns large-5"><div class="box">5</div></div>
            <div class="columns large-1"><div class="box">1</div></div>
        </div>

        <div class="row">
            <div class="columns large-6"><div class="box">6</div></div>
            <div class="columns large-6"><div class="box">6</div></div>
        </div>

        <div class="row">
            <div class="columns large-12"><div class="box">12</div></div>
        </div>

        <div class="row">
            <div class="columns large-4 medium-6 small-12"><div class="box">large-4 medium-6 small-12</div></div>
            <div class="columns large-4 medium-6 small-12"><div class="box">large-4 medium-6 small-12</div></div>
            <div class="columns large-4 medium-6 small-12"><div class="box">large-4 medium-6 small-12</div></div>
            <div class="columns large-4 medium-6 small-12"><div class="box">large-4 medium-6 small-12</div></div>
            <div class="columns large-4 medium-6 small-12"><div class="box">large-4 medium-6 small-12</div></div>
            <div class="columns large-4 medium-6 small-12"><div class="box">large-4 medium-6 small-12</div></div>
        </div> -->

        <!-- <div class="row">
            <div class="columns large-4 medium-6 small-6">
                <div class="box">large-4 medium-6 small-6</div>

                <div class="row">
                    <div class="columns large-6"><div class="box">large-6</div></div>
                    <div class="columns large-6">
                        <div class="row">
                            <div class="columns large-4"><div class="box">large-4</div></div>
                            <div class="columns large-4"><div class="box">large-4</div></div>
                            <div class="columns large-4"><div class="box">large-4</div></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="columns large-4 medium-3 small-6">
                <div class="box">large-4 medium-3 small-6</div>
            </div>
            <div class="columns large-4 medium-3 small-12">
                <div class="box">large-4 medium-3 small-12</div>
            </div>
        </div> -->

    </div>

    <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
    <script src="test.js"></script>
</body>
</html>
