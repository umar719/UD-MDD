FROM quay.io/sampandey001/secktor
RUN git clone https://github.com/ALPHAkaveen/Dark-Nero-v9 /root/ALPHAkaveen
WORKDIR /root/ALPHAkaveen/
RUN npm install npm@latest
RUN yarn install --network-concurrency 1
EXPOSE 8000
CMD ["npm", "start"]
