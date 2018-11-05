FROM ruby:2.4-slim
RUN apt-get update && apt-get install git-core bash make build-essential -y
ADD ./ /
RUN bundle install
ENTRYPOINT ["/bin/svgo-ruby"]
CMD ["--pretty", "--multi-pass"]