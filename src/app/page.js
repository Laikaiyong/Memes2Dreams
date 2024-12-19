"use client";

import { useState, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import Image from "next/image";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createTransferInstruction } from '@solana/spl-token';

const fetchMemeCoins = async () => {
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/coins/markets",
    {
      params: {
        vs_currency: "usd",
        category: "meme-token",
        order: "market_cap_desc",
        per_page: 10,
        sparkline: false,
        include_platform: true  // Add this parameter to get contract addresses
      },
    }
  );
  return response.data.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    image: coin.image,
    price: `$${coin.current_price.toFixed(8)}`,
    change24h: coin.price_change_percentage_24h,
    marketCap: coin.market_cap,
    volume: coin.total_volume,
    address: coin.platforms?.solana || '', // Get Solana contract address if available
    decimals: 9 // Default SPL token decimals
  }));
};

const availableProjects = [
  {
    id: 1,
    name: "Save the Ocean",
    description: "Help clean our oceans through crypto donations",
    target: 50000,
    raised: 32150,
    image: "https://picsum.photos/seed/picsum/200/300",
  },
  {
    id: 2,
    name: "Education for All",
    description: "Providing education to underprivileged children",
    target: 75000,
    raised: 45000,
    image: "https://picsum.photos/seed/cs/200/300",
  },
  {
    id: 3,
    name: "Plant a Tree",
    description: "Contribute to reforestation efforts around the globe",
    target: 30000,
    raised: 15000,
    image: "https://picsum.photos/seed/csum/200/300",
  },
  {
    id: 4,
    name: "Clean Water Initiative",
    description: "Provide access to clean drinking water in developing regions",
    target: 60000,
    raised: 25000,
    image: "https://picsum.photos/seed/sum/200/300",
  },
  {
    id: 5,
    name: "Animal Rescue Fund",
    description: "Support the rescue and rehabilitation of abandoned animals",
    target: 40000,
    raised: 20000,
    image: "https://picsum.photos/seed/pic/200/300",
  },
];

export default function Home() {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [memeCoins, setMemeCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState(0);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const handleTransfer = async (selectedCoin, amount) => {
    if (!selectedCoin || !amount || !publicKey) return;

    try {
      // Create an associated token account for the recipient if it doesn't exist
      const recipientAddress = new PublicKey(
        "CNWU1VWBYqaGgeAQsfJzuwEsEhX6uNsGzbS63hyk8os"
      );

      const transaction = new Transaction();

      // Add instructions to create ATA if needed and transfer tokens
      const transferInstruction = createTransferInstruction(
        publicKey, // from (owner) pubkey
        recipientAddress, // to pubkey
        publicKey, // owner
        amount * (10 ** selectedCoin.decimals)
      );
      transaction.add(transferInstruction);

      const { blockhash } = await connection.getLatestBlockhash(); // Get the latest blockhash
      transaction.recentBlockhash = blockhash; // Set the recent blockhash
      transaction.feePayer = publicKey; // Set the fee payer

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction({
        signature,
        commitment: "processed",
      }); // Updated confirmation method

      console.log("Transfer successful:", signature);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  useEffect(() => {
    const loadMemeCoins = async () => {
      try {
        const coins = await fetchMemeCoins();
        setMemeCoins(coins);
      } catch (error) {
        console.error("Error fetching meme coins:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMemeCoins();
  }, []);

  useEffect(() => {
    if (selectedCoin) {
      // Fetch the maximum amount from the user's wallet for the selectedCoin
      // setMaxAmount(fetchedMaxAmount);
    }
  }, [selectedCoin]);

  return (
    <div className="min-h-screen bg-[#121212]">
      <nav className="flex justify-between items-center p-6 bg-[#1a1a1a]">
        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195] animate-gradient-text">
          Memes2Dreams
        </div>
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-glow"></div>
          <WalletMultiButton className="bg-[#1a1a1a] hover:!bg-[#252525] !text-white relative px-6 py-2 rounded-lg transition-all duration-300" />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="mb-8">
            <Image 
              src="/logo.png" 
              alt="App Logo" 
              className="mx-auto w-64 h-64" 
              width={200} // Set appropriate width
              height={200} // Set appropriate height
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-8 animate-fade-in">
            Create Impact with MEMES
          </h1>

          <div className="relative w-full max-w-md mx-auto mb-8">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-4 bg-[#1a1a1a] text-white rounded-xl border border-gray-700 hover:border-[#9945FF] transition-all duration-300 flex items-center justify-between">
                {selectedCoin ? (
                  <div className="flex items-center">
                    <Image
                      src={selectedCoin.image}
                      alt={selectedCoin.name}
                      className="w-6 h-6 mr-2"
                      width={24}
                      height={24}
                    />
                    <span>{selectedCoin.name}</span>
                  </div>
                ) : (
                  "Select a Meme Coin"
                )}
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute w-full mt-2 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50 animate-slide-down">
                  {memeCoins.map((coin) => (
                    <div
                      key={coin.id}
                      onClick={() => {
                        setSelectedCoin(coin);
                        setIsDropdownOpen(false);
                      }}
                      className="p-4 hover:bg-[#252525] cursor-pointer border-b border-gray-700 last:border-0">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          className="w-8 h-8"
                          width={32}
                          height={32}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-white font-medium">
                              {coin.name}
                            </h3>
                            <span className="text-gray-400">{coin.symbol}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-400">{coin.price}</span>
                            <span
                              className={
                                coin.change24h >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }>
                              {coin.change24h?.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedCoin && (
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-700 mb-8 animate-fade-in">
              <div className="flex items-center justify-center space-x-4">
                <Image
                  src={selectedCoin.image}
                  alt={selectedCoin.name}
                  className="w-16 h-16"
                  width={64}
                  height={64}
                />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">
                    {selectedCoin.name}
                  </h3>
                  <p className="text-gray-400">{selectedCoin.symbol}</p>
                  <p className="text-white">{selectedCoin.price}</p>
                  <p
                    className={`${
                      selectedCoin.change24h >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}>
                    {selectedCoin.change24h?.toFixed(2)}% (24h)
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {availableProjects.map((project) => (
              <div
                key={project.id}
                className="bg-[#1a1a1a] rounded-xl border border-gray-700 overflow-hidden hover:border-[#9945FF] transition-all duration-300 animate-fade-in">
                <Image
                  src={project.image}
                  alt={project.name}
                  className="w-full h-48 object-cover"
                  width={384}
                  height={192}
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {project.name}
                  </h3>
                  <p className="text-gray-400 mb-4">{project.description}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-[#9945FF] to-[#14F195] h-2 rounded-full animate-pulse"
                      style={{
                        width: `${(project.raised / project.target) * 100}%`,
                      }}></div>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Raised: ${project.raised.toLocaleString()}</span>
                    <span>Target: ${project.target.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      type="number"
                      placeholder="Amount"
                      className="border border-gray-700 bg-[#1a1a1a] text-white rounded-lg py-2 px-4 w-32"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                    />
                    <button
                      onClick={() => {
                        setDonationAmount(maxAmount);
                      }}
                      className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition duration-300">
                      MAX
                    </button>
                    <button
                      onClick={() =>
                        handleTransfer(selectedCoin, donationAmount)
                      }
                      className="bg-[#9945FF] text-white py-2 px-4 rounded-lg hover:bg-[#14F195] transition duration-300">
                      Donate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-6 bg-[#1a1a1a]">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Powered by</span>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg opacity-50 scale-125"></div>
              <Image
                src="https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Solana_logo.png/252px-Solana_logo.png"
                alt="Solana"
                className="h-6 relative z-10"
                width={24}
                height={24}
              />
            </div>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg opacity-50 scale-125"></div>
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/b/b0/CoinGecko_logo.png"
                alt="Coingecko"
                className="h-6 relative z-10"
                width={24}
                height={24}
              />
            </div>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg opacity-50 scale-125"></div>
              <Image
                src="https://static-00.iconduck.com/assets.00/nextjs-icon-1024x1024-5et230l7.png"
                alt="Next"
                className="h-6 relative z-10"
                width={24}
                height={24}
              />
            </div>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg opacity-50 scale-125"></div>
              <Image
                src="https://static.wikia.nocookie.net/logopedia/images/a/a7/Vercel_favicon.svg"
                alt="Vercel"
                className="h-6 relative z-10"
                width={24}
                height={24}
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors">
              Terms
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
