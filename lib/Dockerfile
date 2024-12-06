FROM quay.io/sampandey001/secktor

# Clone the repository
RUN git clone https://github.com/umar719/UD-MDD /root/umar719

# Set the working directory
WORKDIR /root/umar719/

# Upgrade Node.js to version 20 (or compatible version)
RUN npm install -g n && n 20

# Update npm to the latest version
RUN npm install -g npm@latest

# Clean up potential conflicts between npm and yarn
RUN rm -f package-lock.json

# Install dependencies using Yarn
RUN yarn install --network-concurrency 1

# Expose the port used by the bot
EXPOSE 8000

# Start the bot
CMD ["npm", "start"]
