package com.esports.repository;

import com.esports.entity.GameTitle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameTitleRepository extends JpaRepository<GameTitle, Long> {
}