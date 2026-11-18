package com.esports.controller;

import com.esports.entity.GameTitle;
import com.esports.repository.GameTitleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameTitleController {
    private final GameTitleRepository gameRepo;

    @GetMapping
    public List<GameTitle> getAll() {
        return gameRepo.findAll();
    }

    @PostMapping
    public GameTitle create(@RequestBody GameTitle game) {
        return gameRepo.save(game);
    }

    @PutMapping("/{id}")
    public GameTitle update(@PathVariable Long id, @RequestBody GameTitle req) {
        GameTitle g = gameRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy trò chơi."));
        g.setGameName(req.getGameName());
        g.setPublisher(req.getPublisher());
        return gameRepo.save(g);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        gameRepo.deleteById(id);
    }
}