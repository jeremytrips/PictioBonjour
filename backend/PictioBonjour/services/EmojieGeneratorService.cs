namespace PictioBonjour.services
{
    public class EmojieGeneratorService
    {
        private List<string> _emojis = [];
        private Random _random = new();

        public EmojieGeneratorService()
        {
            addEmojisToListEmjis();

        }

        private void addEmojisToListEmjis()
        {
            string path = @"Ressource/Emojis.txt";
            try
            {
                if (File.Exists(path))
                {
                    using (StreamReader sr = File.OpenText(path))
                    {
                        string s = "";
                        while ((s = sr.ReadLine()) != null)
                        {

                            _emojis.Add(s);
                        }
                    }
                }
                else
                {
                    Console.WriteLine("Fichier introuvable");
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        public string GenerateTargetEmoji()
        {
            int randomIndex = _random.Next(_emojis.Count);
            return _emojis[randomIndex];
        }
        public List<string> GeneratePotentialEmoji()
        {
            List<string> potentialEmojis = [];
            while (potentialEmojis.Count < 6) // 1 cible + 5 options = 6 au total
            {
                int randomIndex = _random.Next(_emojis.Count);
                potentialEmojis.Add(_emojis[randomIndex]);
            }
            return potentialEmojis;
        }
    }
}

