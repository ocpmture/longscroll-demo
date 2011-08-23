namespace :populate do 
    desc "Populate random data"
    task :populate => :environment do
      require 'populator'
      Post.populate 1..5000 do |post|
        post.link_id = 1
        post.author = "Poster #{Populator.words(1)}"
        post.content = Populator.paragraphs(rand(3)+1)
      end
    end
end