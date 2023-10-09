# CODYS HOUSE

Cody's House is a Jekyll based on [Cody House Componants](https://codyhouse.co/ds/components)

## Installation

Add this line to your Jekyll site's `Gemfile`:

```ruby
gem "codys-house"
```

And add this line to your Jekyll site's `_config.yml`:

```yaml
theme: codys-house
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install codys-house

## Config File 

Please read the _config.yml before making any major changes to the site. I promise you this will save some head ache. 

## Data

Data and the _config.yml are used as much as possible to automate entering data into the site. After entering your information in the config file, go to the data file and twek that data before moving on. This will ensure the site has everything pertinant to your new site. 

## Componants

Componants are done as includes in this template and, can be included like so:

```html
{% include sections/hero.html %}
```

I have taken the liberty of organizing the componants as to avoid a massive build of componants in the includes folder. I have also renamed a few of the componants. IE Feature 14 is now device features but, include all four of the feature. 

### Navigation

- [Mega Navigation]()
- [Footer](https://codyhouse.co/ds/components/info/main-footer) 

### Heros

- [Hero](https://codyhouse.co/ds/components/info/hero)
- [Sticky Hero](https://codyhouse.co/ds/components/info/sticky-hero)
- [Boxed Hero](https://codyhouse.co/ds/components/info/boxed-hero)
- [Video Hero](https://codyhouse.co/ds/components/info/video-background-hero)

### Sections

- [FAQ](https://codyhouse.co/ds/components/info/faq-v3)

### Testimonials

- [Large Testimonial](https://codyhouse.co/ds/components/info/testimonial)
- [Testimonial Banner](https://codyhouse.co/ds/components/info/testimonial-banner)

### Features

- [Sticky Feature](https://codyhouse.co/ds/components/info/sticky-feature)
- [Tabbed Feature](https://codyhouse.co/ds/components/info/tabbed-features-v2)
- [Device Features](https://codyhouse.co/ds/components/info/feature-v14)
- [Diamond Grid Feature](https://codyhouse.co/ds/components/info/feature-v13)

### Forms

- [Contact](https://codyhouse.co/ds/components/info/form-template)
- [Contact 3](https://codyhouse.co/ds/components/info/form-template-v3)

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/[USERNAME]/codys-house. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

## Development

To set up your environment to develop this theme, run `bundle install`.

Your theme is setup just like a normal Jekyll site! To test your theme, run `bundle exec jekyll serve` and open your browser at `http://localhost:4000`. This starts a Jekyll server using your theme. Add pages, documents, data, etc. like normal to test your theme's contents. As you make modifications to your theme and to your content, your site will regenerate and you should see the changes in the browser after a refresh, just like normal.

When your theme is released, only the files in `_layouts`, `_includes`, `_sass` and `assets` tracked with Git will be bundled.
To add a custom directory to your theme-gem, please edit the regexp in `codys-house.gemspec` accordingly.

## License

The theme is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
