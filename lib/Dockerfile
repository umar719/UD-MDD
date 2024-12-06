FROM quay.io/sampandey001/secktor
RUN git clone https://github.com/umar719/UD-MDD /root/umar719
WORKDIR /root/umar719/
RUN npm install npm@latest
RUN yarn install --network-concurrency 1
EXPOSE 8000
CMD ["npm", "start"]
