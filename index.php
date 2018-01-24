<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>roolith CSS framework</title>

    <link rel="stylesheet" href="dist/css/roolith.css?v=<?= time() ?>">
    <style>

    </style>
</head>
<body>
    <div class="container">

        <br><br>
        <form class="form" action="./" method="post">
            <div class="row">
                <div class="columns large-6">
                    <div class="form-field">
                        <label for="name" class="form-label">Enter your name</label>
                        <input type="text" name="name" id="name" class="form-input" placeholder="e.g James smith">
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                    <div class="form-field">
                        <label for="email" class="form-label">Email address</label>
                        <input type="email" name="email" id="email" class="form-input" placeholder="e.g james@example.com">
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                </div>
                <div class="columns large-6">

                    <div class="form-field">
                        <label for="message" class="form-label">Message</label>
                        <textarea name="message" id="message" class="form-textarea" placeholder="e.g Write something here!"></textarea>
                        <small class="form-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</small>
                    </div>

                </div>
            </div>
        </form>

        <!-- <div class="column">
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorem qui molestias consequatur inventore. Perspiciatis odio vitae necessitatibus cum sunt, illo voluptas, placeat odit similique repellendus ipsam cumque autem dolorum quia?</p>
        </div>

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
</body>
</html>
